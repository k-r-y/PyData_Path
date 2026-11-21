import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  AlertTriangle,
  ClipboardCopy,
  ClipboardPaste,
  Eraser,
  Play,
  RotateCcw,
  Square,
  Terminal as TerminalIcon,
} from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider';
import { getSetting, saveSetting } from '../../db/database';
import {
  TerminalSession,
  supportsSharedArrayBuffer,
  type TerminalStatus,
} from '../../runtime/terminalSession';
import type { VirtualFileEntry } from '../../runtime/terminal.worker';

const MAX_OUTPUT_LINES = 10000;
const HISTORY_LIMIT = 200;

interface TerminalPaneProps {
  /** Lazily boot Pyodide REPL only once active is true. */
  active: boolean;
  /** Optional editor code for "Load my code into terminal". */
  editorCode?: string;
  editorFilename?: string;
  /** Virtual workspace files mirrored into /workspace. */
  vfsFiles?: VirtualFileEntry[];
  onVfsFilesChanged?: (files: VirtualFileEntry[]) => void;
  /** Incrementing trigger token to run editor code into terminal from parent toolbar. */
  externalLoadSignal?: number;
}

function lcp(items: string[]): string {
  if (items.length === 0) return '';
  return items.reduce((a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });
}

export function TerminalPane({
  active,
  editorCode,
  editorFilename,
  vfsFiles = [],
  onVfsFilesChanged,
  externalLoadSignal = 0,
}: TerminalPaneProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const sessionRef = useRef<TerminalSession | null>(null);

  const [status, setStatus] = useState<TerminalStatus>('uninitialized');
  const [shellMode, setShellMode] = useState(false);
  const [cwd, setCwd] = useState('/workspace');
  const [queuedStdinText, setQueuedStdinText] = useState('');
  const [queuedCount, setQueuedCount] = useState(0);
  const [liveStatusMsg, setLiveStatusMsg] = useState('');

  const shellModeRef = useRef(shellMode);
  shellModeRef.current = shellMode;
  const cwdRef = useRef(cwd);
  cwdRef.current = cwd;
  const statusRef = useRef(status);
  statusRef.current = status;
  const vfsFilesRef = useRef(vfsFiles);
  vfsFilesRef.current = vfsFiles;
  const onVfsChangedRef = useRef(onVfsFilesChanged);
  onVfsChangedRef.current = onVfsFilesChanged;

  // Interactive line buffer state
  const promptRef = useRef<string>('>>> ');
  const bufferRef = useRef<string>('');
  const cursorRef = useRef<number>(0);
  const stdinLineRef = useRef<string>('');
  const awaitingStdinRef = useRef<boolean>(false);
  const replHistoryRef = useRef<string[]>([]);
  const shellHistoryRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number | null>(null);
  const outputLinesCountRef = useRef<number>(0);
  const bootedRef = useRef<boolean>(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const queueInputId = useId();
  const isolated = supportsSharedArrayBuffer();

  const currentPrompt = useCallback(() => {
    if (shellModeRef.current) {
      return `${cwdRef.current} $ `;
    }
    return promptRef.current;
  }, []);

  const writeSafe = useCallback((rawText: string, colorAnsi?: string) => {
    const term = xtermRef.current;
    if (!term || !rawText) return;
    let normalized = rawText.replace(/\r?\n/g, '\r\n');
    const newLines = (normalized.match(/\n/g) ?? []).length;
    outputLinesCountRef.current += newLines;
    if (outputLinesCountRef.current > MAX_OUTPUT_LINES) {
      const lines = normalized.split('\r\n');
      if (lines.length > 500) {
        normalized =
          '\x1b[33m[Output capped at ~10,000 lines; older overflow trimmed]\x1b[0m\r\n' +
          lines.slice(-500).join('\r\n');
      }
      outputLinesCountRef.current = MAX_OUTPUT_LINES;
    }
    if (colorAnsi) {
      term.write(`${colorAnsi}${normalized}\x1b[0m`);
    } else {
      term.write(normalized);
    }
  }, []);

  const refreshLine = useCallback(() => {
    const term = xtermRef.current;
    if (!term) return;
    const p = awaitingStdinRef.current ? '' : currentPrompt();
    const buf = awaitingStdinRef.current ? stdinLineRef.current : bufferRef.current;
    const cur = awaitingStdinRef.current ? stdinLineRef.current.length : cursorRef.current;
    const left = p + buf.slice(0, cur);
    const right = buf.slice(cur);
    term.write(`\x1b[0G${left}\x1b[s${right}\x1b[0K\x1b[u`);
  }, [currentPrompt]);

  const setBuffer = useCallback(
    (next: string, nextCursor?: number) => {
      if (awaitingStdinRef.current) {
        stdinLineRef.current = next;
        refreshLine();
        return;
      }
      bufferRef.current = next;
      cursorRef.current =
        nextCursor === undefined ? next.length : Math.max(0, Math.min(nextCursor, next.length));
      refreshLine();
    },
    [refreshLine]
  );

  const pushHistory = useCallback((line: string, isShell: boolean) => {
    const trimmed = line.trimEnd();
    if (!trimmed) return;
    const arr = isShell ? shellHistoryRef.current : replHistoryRef.current;
    if (arr[arr.length - 1] !== trimmed) {
      arr.push(trimmed);
      if (arr.length > HISTORY_LIMIT) arr.shift();
      saveSetting(
        isShell ? 'terminalShellHistory' : 'terminalReplHistory',
        arr
      ).catch(() => {});
    }
  }, []);

  const executeSubmittedLine = useCallback(
    async (rawLine: string) => {
      const term = xtermRef.current;
      const session = sessionRef.current;
      if (!term || !session) return;

      if (shellModeRef.current) {
        pushHistory(rawLine, true);
        historyIdxRef.current = null;
        try {
          const res = await session.shellCommand(rawLine);
          setCwd(res.cwd);
          cwdRef.current = res.cwd;
          if (res.action === 'clear') {
            term.clear();
            outputLinesCountRef.current = 0;
          } else if (res.action === 'enterRepl' || res.action === 'exitShell') {
            setShellMode(false);
            shellModeRef.current = false;
            promptRef.current = '>>> ';
            writeSafe(
              `Switched to Python ${session.pythonVersion} REPL.\r\n`,
              '\x1b[36m'
            );
          }
        } catch (err) {
          writeSafe(
            `${err instanceof Error ? err.message : String(err)}\r\n`,
            '\x1b[31m'
          );
        }
        return;
      }

      if (rawLine.trim() === 'clear') {
        term.clear();
        outputLinesCountRef.current = 0;
        promptRef.current = '>>> ';
        return;
      }

      pushHistory(rawLine, false);
      historyIdxRef.current = null;
      try {
        const res = await session.pushLine(rawLine);
        promptRef.current = res.prompt;
        if (res.syntaxCheck === 'syntax-error' && res.errorText) {
          writeSafe(`${res.errorText}\r\n`, '\x1b[31m');
        } else if (res.syntaxCheck === 'complete') {
          if (res.valueText !== undefined) {
            writeSafe(`${res.valueText}\r\n`);
          } else if (res.errorText) {
            writeSafe(`${res.errorText}\r\n`, '\x1b[31m');
          }
        }
      } catch (err) {
        promptRef.current = '>>> ';
        writeSafe(
          `${err instanceof Error ? err.message : String(err)}\r\n`,
          '\x1b[31m'
        );
      }
    },
    [pushHistory, writeSafe]
  );

  const handlePasteText = useCallback(
    async (text: string) => {
      const term = xtermRef.current;
      if (!term) return;
      const normalized = text.replace(/\r\n?/g, '\n');
      if (!normalized.includes('\n')) {
        const before = bufferRef.current.slice(0, cursorRef.current);
        const after = bufferRef.current.slice(cursorRef.current);
        setBuffer(before + normalized + after, cursorRef.current + normalized.length);
        return;
      }

      if (awaitingStdinRef.current) {
        const lines = normalized.split('\n');
        const session = sessionRef.current;
        if (session && lines.length > 0) {
          const first = stdinLineRef.current + lines[0];
          const remaining = lines.slice(1).filter((l, i, arr) => i < arr.length - 1 || l !== '');
          if (remaining.length > 0) {
            session.enqueueStdinLines(remaining);
          }
          awaitingStdinRef.current = false;
          stdinLineRef.current = '';
          term.write('\r\n');
          session.submitSharedStdinLine(first);
        }
        return;
      }

      const endsNl = normalized.endsWith('\n');
      const lines = normalized.split('\n');
      if (endsNl) lines.pop();
      const cleaned = lines.map((l) => l.replace(/^\s*(>>>|\.\.\.)\s?/, ''));
      const executable = endsNl ? cleaned : cleaned.slice(0, -1);

      for (const line of executable) {
        setBuffer(line);
        term.write('\r\n');
        await executeSubmittedLine(line);
        bufferRef.current = '';
        cursorRef.current = 0;
      }
      if (!endsNl) {
        const tail = cleaned[cleaned.length - 1] ?? '';
        bufferRef.current = '';
        cursorRef.current = 0;
        term.write(currentPrompt());
        if (tail) setBuffer(tail);
      } else {
        term.write(currentPrompt());
      }
    },
    [currentPrompt, executeSubmittedLine, setBuffer]
  );

  // Sync VFS files whenever playground edits files and session is ready
  useEffect(() => {
    if (sessionRef.current && sessionRef.current.getStatus() !== 'uninitialized') {
      sessionRef.current.syncFiles(vfsFiles);
    }
  }, [vfsFiles]);

  // Update xterm theme dynamically without recreating terminal
  useEffect(() => {
    const term = xtermRef.current;
    if (!term) return;
    term.options.theme =
      resolvedTheme === 'dark'
        ? {
            background: '#09090b',
            foreground: '#e5e5e5',
            cursor: '#fafafa',
            selectionBackground: '#3f3f46',
          }
        : {
            background: '#ffffff',
            foreground: '#171717',
            cursor: '#0a0a0a',
            selectionBackground: '#e5e5e5',
          };
  }, [resolvedTheme]);

  // Mount xterm + lazy-boot terminal worker only once active becomes true
  useEffect(() => {
    if (!active || bootedRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    bootedRef.current = true;
    let cancelled = false;

    const term = new XTerm({
      scrollback: MAX_OUTPUT_LINES,
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'var(--font-mono)',
      theme:
        resolvedTheme === 'dark'
          ? {
              background: '#09090b',
              foreground: '#e5e5e5',
              cursor: '#fafafa',
              selectionBackground: '#3f3f46',
            }
          : {
              background: '#ffffff',
              foreground: '#171717',
              cursor: '#0a0a0a',
              selectionBackground: '#e5e5e5',
            },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();

    xtermRef.current = term;
    fitRef.current = fitAddon;

    const ro = new ResizeObserver(() => {
      fitAddon.fit();
    });
    ro.observe(container);

    const session = new TerminalSession({
      onOutput: (stream, text) => {
        writeSafe(text, stream === 'stderr' ? '\x1b[31m' : undefined);
      },
      onStatusChange: setStatus,
      onStdinRequest: () => {
        awaitingStdinRef.current = true;
        stdinLineRef.current = '';
        term.focus();
      },
      onVfsChanged: (files) => {
        onVfsChangedRef.current?.(files);
      },
    });
    sessionRef.current = session;

    Promise.all([
      getSetting<string[]>('terminalReplHistory', []),
      getSetting<string[]>('terminalShellHistory', []),
    ]).then(([rh, sh]) => {
      if (Array.isArray(rh)) replHistoryRef.current = rh;
      if (Array.isArray(sh)) shellHistoryRef.current = sh;
    });

    term.writeln('Starting isolated Python terminal worker...');
    session
      .start(vfsFilesRef.current)
      .then((info) => {
        if (cancelled) return;
        setCwd(info.cwd);
        cwdRef.current = info.cwd;
        term.writeln(`PyData Path REPL (Python ${info.pythonVersion})`);
        term.writeln(
          session.isolated
            ? 'Cross-origin isolated: interactive input() and Ctrl+C interrupt enabled.'
            : 'Standard isolation: use Queued stdin below before calling input().'
        );
        term.write(currentPrompt());
      })
      .catch((err) => {
        if (cancelled) return;
        writeSafe(
          `Failed to start terminal runtime: ${err instanceof Error ? err.message : String(err)}\r\n`,
          '\x1b[31m'
        );
      });

    const dataDisposable = term.onData(async (data) => {
      const st = statusRef.current;

      // Ctrl+C handling
      if (data === '\u0003') {
        if (st === 'running' || st === 'waiting_stdin') {
          awaitingStdinRef.current = false;
          stdinLineRef.current = '';
          if (session.sendInterrupt()) {
            term.write('^C\r\n');
          } else {
            writeSafe(
              '\r\nCtrl+C interrupt needs SharedArrayBuffer; use Stop to terminate and restart.\r\n',
              '\x1b[33m'
            );
          }
          return;
        }
        session.clearIncompleteBuffer();
        bufferRef.current = '';
        cursorRef.current = 0;
        promptRef.current = '>>> ';
        historyIdxRef.current = null;
        term.write(`^C\r\n${currentPrompt()}`);
        return;
      }

      // Ctrl+D sends EOF when waiting for blocking stdin
      if (data === '\u0004' && awaitingStdinRef.current) {
        awaitingStdinRef.current = false;
        stdinLineRef.current = '';
        term.write('^D\r\n');
        session.submitSharedStdinLine(null);
        return;
      }

      // Copy selection with Ctrl+Shift+C / standard keybinding fallback handled via button too
      if (awaitingStdinRef.current) {
        if (data === '\r') {
          const line = stdinLineRef.current;
          awaitingStdinRef.current = false;
          stdinLineRef.current = '';
          term.write('\r\n');
          session.submitSharedStdinLine(line);
        } else if (data === '\u007F') {
          if (stdinLineRef.current.length > 0) {
            stdinLineRef.current = stdinLineRef.current.slice(0, -1);
            refreshLine();
          }
        } else if (!data.startsWith('\x1b')) {
          await handlePasteText(data);
        }
        return;
      }

      if (st === 'running' || st === 'loading' || st === 'uninitialized') {
        return;
      }

      switch (data) {
        case '\r': {
          const submitted = bufferRef.current;
          term.write('\r\n');
          bufferRef.current = '';
          cursorRef.current = 0;
          await executeSubmittedLine(submitted);
          term.write(currentPrompt());
          break;
        }
        case '\u007F': {
          if (cursorRef.current > 0) {
            const before = bufferRef.current.slice(0, cursorRef.current - 1);
            const after = bufferRef.current.slice(cursorRef.current);
            setBuffer(before + after, cursorRef.current - 1);
          }
          break;
        }
        case '\x1B[A': {
          // Up arrow
          const hist = shellModeRef.current ? shellHistoryRef.current : replHistoryRef.current;
          if (hist.length === 0) break;
          if (historyIdxRef.current === null) historyIdxRef.current = hist.length;
          if (historyIdxRef.current > 0) {
            historyIdxRef.current -= 1;
            const entry = hist[historyIdxRef.current] ?? '';
            setBuffer(entry, entry.length);
          }
          break;
        }
        case '\x1B[B': {
          // Down arrow
          const hist = shellModeRef.current ? shellHistoryRef.current : replHistoryRef.current;
          if (historyIdxRef.current !== null) {
            if (historyIdxRef.current < hist.length - 1) {
              historyIdxRef.current += 1;
              const entry = hist[historyIdxRef.current] ?? '';
              setBuffer(entry, entry.length);
            } else {
              historyIdxRef.current = null;
              setBuffer('', 0);
            }
          }
          break;
        }
        case '\x1B[C': {
          if (cursorRef.current < bufferRef.current.length) {
            cursorRef.current += 1;
            refreshLine();
          }
          break;
        }
        case '\x1B[D': {
          if (cursorRef.current > 0) {
            cursorRef.current -= 1;
            refreshLine();
          }
          break;
        }
        case '\x1B[H':
        case '\u0001': {
          cursorRef.current = 0;
          refreshLine();
          break;
        }
        case '\x1B[F':
        case '\u0005': {
          cursorRef.current = bufferRef.current.length;
          refreshLine();
          break;
        }
        case '\t': {
          if (!shellModeRef.current) {
            const prefixSrc = bufferRef.current.slice(0, cursorRef.current);
            if (!prefixSrc.trim()) {
              setBuffer(
                bufferRef.current.slice(0, cursorRef.current) +
                  '    ' +
                  bufferRef.current.slice(cursorRef.current),
                cursorRef.current + 4
              );
              break;
            }
            try {
              const { completions, start } = await session.complete(prefixSrc);
              if (completions.length === 1) {
                setBuffer(
                  bufferRef.current.slice(0, start) +
                    completions[0] +
                    bufferRef.current.slice(cursorRef.current),
                  start + completions[0].length
                );
              } else if (completions.length > 1) {
                const common = lcp(completions);
                const word = prefixSrc.slice(start);
                if (common.length > word.length) {
                  setBuffer(
                    bufferRef.current.slice(0, start) +
                      common +
                      bufferRef.current.slice(cursorRef.current),
                    start + common.length
                  );
                } else {
                  term.write('\r\n');
                  term.writeln(completions.slice(0, 60).join('  '));
                  refreshLine();
                }
              }
            } catch {
              // Ignore autocomplete failures
            }
          } else {
            // Simple shell filename completion from synced VFS files
            const parts = bufferRef.current.slice(0, cursorRef.current).split(/\s+/);
            const lastWord = parts[parts.length - 1] ?? '';
            const matches = vfsFilesRef.current
              .map((f) => f.path)
              .filter((p) => p.startsWith(lastWord));
            if (matches.length === 1) {
              const startIdx = cursorRef.current - lastWord.length;
              setBuffer(
                bufferRef.current.slice(0, startIdx) +
                  matches[0] +
                  bufferRef.current.slice(cursorRef.current),
                startIdx + matches[0].length
              );
            }
          }
          break;
        }
        default: {
          if (!data.startsWith('\x1b')) {
            await handlePasteText(data);
          }
        }
      }
    });

    return () => {
      cancelled = true;
      dataDisposable.dispose();
      ro.disconnect();
      term.dispose();
      session.destroy();
      bootedRef.current = false;
    };
  }, [active]);

  // Refit whenever container becomes visible again
  useEffect(() => {
    if (active && fitRef.current) {
      requestAnimationFrame(() => fitRef.current?.fit());
    }
  }, [active]);

  const handleLoadEditorCode = useCallback(async () => {
    const session = sessionRef.current;
    const term = xtermRef.current;
    if (!session || !term || !editorCode) return;
    if (shellModeRef.current) {
      setShellMode(false);
      shellModeRef.current = false;
    }
    term.write('\r\n');
    writeSafe(
      `[Loaded ${editorFilename ?? 'editor code'} into REPL namespace]\r\n`,
      '\x1b[36m'
    );
    await session.loadCode(editorCode, editorFilename ?? '<editor>');
    promptRef.current = '>>> ';
    bufferRef.current = '';
    cursorRef.current = 0;
    term.write(currentPrompt());
    term.focus();
    setLiveStatusMsg('Editor code loaded into terminal namespace.');
  }, [currentPrompt, editorCode, editorFilename, writeSafe]);

  useEffect(() => {
    if (externalLoadSignal > 0 && editorCode) {
      handleLoadEditorCode();
    }
  }, [externalLoadSignal]);

  const handleClear = () => {
    xtermRef.current?.clear();
    outputLinesCountRef.current = 0;
    xtermRef.current?.write(currentPrompt());
    setLiveStatusMsg('Terminal cleared.');
  };

  const handleCopy = async () => {
    const term = xtermRef.current;
    if (!term) return;
    const sel = term.getSelection();
    const text =
      sel ||
      Array.from({ length: term.buffer.active.length }, (_, i) =>
        term.buffer.active.getLine(i)?.translateToString(true) ?? ''
      )
        .join('\n')
        .trimEnd();
    try {
      await navigator.clipboard.writeText(text);
      setLiveStatusMsg(sel ? 'Copied selection to clipboard.' : 'Copied terminal buffer to clipboard.');
    } catch {
      setLiveStatusMsg('Clipboard copy permission denied.');
    }
  };

  const handlePasteButton = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        await handlePasteText(clip);
        xtermRef.current?.focus();
        setLiveStatusMsg('Pasted clipboard contents into terminal.');
      }
    } catch {
      setLiveStatusMsg('Clipboard read permission denied; use Ctrl+V or Cmd+V inside terminal.');
    }
  };

  const handleReset = async () => {
    const session = sessionRef.current;
    const term = xtermRef.current;
    if (!session || !term) return;
    await session.resetRepl();
    promptRef.current = '>>> ';
    bufferRef.current = '';
    cursorRef.current = 0;
    term.clear();
    outputLinesCountRef.current = 0;
    writeSafe('REPL namespace reset.\r\n', '\x1b[36m');
    term.write(currentPrompt());
    setLiveStatusMsg('REPL namespace reset.');
  };

  const handleStopRestart = async () => {
    const session = sessionRef.current;
    const term = xtermRef.current;
    if (!session || !term) return;
    awaitingStdinRef.current = false;
    stdinLineRef.current = '';
    writeSafe(
      '\r\n[Worker stopped and restarted. All REPL variables and in-memory Python state were lost.]\r\n',
      '\x1b[33m'
    );
    try {
      await session.stopAndRestart(vfsFilesRef.current);
      promptRef.current = '>>> ';
      bufferRef.current = '';
      cursorRef.current = 0;
      term.write(currentPrompt());
      setLiveStatusMsg('Terminal worker stopped and restarted; in-memory state lost.');
    } catch (err) {
      writeSafe(
        `Restart failed: ${err instanceof Error ? err.message : String(err)}\r\n`,
        '\x1b[31m'
      );
    }
  };

  const handleToggleShell = () => {
    const next = !shellMode;
    setShellMode(next);
    shellModeRef.current = next;
    historyIdxRef.current = null;
    bufferRef.current = '';
    cursorRef.current = 0;
    const term = xtermRef.current;
    if (term) {
      term.write('\r\n');
      if (next) {
        writeSafe(
          "Simulated Shell enabled on virtual FS. Type 'help' for commands.\r\n",
          '\x1b[36m'
        );
      } else {
        writeSafe('Switched back to Python REPL.\r\n', '\x1b[36m');
      }
      term.write(currentPrompt());
      term.focus();
    }
    setLiveStatusMsg(next ? 'Simulated shell mode enabled.' : 'Python REPL mode enabled.');
  };

  const handleEnqueueStdin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionRef.current) return;
    const lines = queuedStdinText.replace(/\r\n?/g, '\n').split('\n');
    sessionRef.current.enqueueStdinLines(lines);
    setQueuedCount((c) => c + lines.length);
    setQueuedStdinText('');
    setLiveStatusMsg(`Queued ${lines.length} input line${lines.length === 1 ? '' : 's'}.`);
  };

  const handleToolbarKeyDown = (e: React.KeyboardEvent) => {
    const bar = toolbarRef.current;
    if (!bar) return;
    const buttons = Array.from(bar.querySelectorAll<HTMLButtonElement>('button'));
    const curIdx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (curIdx < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight') next = (curIdx + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (curIdx - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    if (next >= 0) {
      e.preventDefault();
      buttons.forEach((b, i) => {
        b.tabIndex = i === next ? 0 : -1;
      });
      buttons[next].focus();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[260px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] overflow-hidden">
      {/* Toolbar */}
      <div
        ref={toolbarRef}
        role="toolbar"
        aria-label="Terminal controls"
        onKeyDown={handleToolbarKeyDown}
        className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0d0d0f]"
      >
        <div role="group" aria-label="Mode and execution" className="flex flex-wrap items-center gap-1.5">
          {editorCode !== undefined && (
            <button
              type="button"
              tabIndex={0}
              disabled={status === 'uninitialized' || status === 'loading'}
              onClick={handleLoadEditorCode}
              className="inline-flex items-center gap-1 min-h-6 px-2.5 py-1 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-medium text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40"
            >
              <Play className="w-3 h-3" aria-hidden="true" />
              Load my code into terminal
            </button>
          )}

          <button
            type="button"
            tabIndex={editorCode !== undefined ? -1 : 0}
            aria-pressed={shellMode}
            onClick={handleToggleShell}
            className={`inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border text-[11px] font-mono ${
              shellMode
                ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <TerminalIcon className="w-3 h-3" aria-hidden="true" />
            Simulated Shell
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={handleStopRestart}
            title="Terminate and restart terminal worker (in-memory state is lost)"
            className="inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[11px] hover:bg-rose-100 dark:hover:bg-rose-950/50"
          >
            <Square className="w-3 h-3" aria-hidden="true" />
            Stop
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={handleReset}
            title="Clear Python REPL variables without restarting worker"
            className="inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div role="group" aria-label="Buffer actions" className="flex items-center gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={handleCopy}
            aria-label="Copy terminal selection or output"
            title="Copy"
            className="inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ClipboardCopy className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={handlePasteButton}
            aria-label="Paste clipboard into terminal"
            title="Paste"
            className="inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ClipboardPaste className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            aria-label="Clear terminal display"
            title="Clear"
            className="inline-flex items-center gap-1 min-h-6 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Eraser className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Permanent Simulated Shell Banner */}
      {shellMode && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-[11px] font-mono">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>SIMULATED SHELL on a virtual file system. This is not your computer&apos;s terminal.</span>
        </div>
      )}

      {/* Stdin Mode Banner / Queued Stdin Fallback Box */}
      {!isolated && (
        <form
          onSubmit={handleEnqueueStdin}
          className="flex flex-wrap items-center gap-2 px-2.5 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#111113] text-[11px]"
        >
          <label htmlFor={queueInputId} className="font-mono text-neutral-600 dark:text-neutral-300">
            Queued stdin (EOFError when empty):
          </label>
          <input
            id={queueInputId}
            type="text"
            value={queuedStdinText}
            onChange={(e) => setQueuedStdinText(e.target.value)}
            placeholder="Line for next input() call"
            className="flex-1 min-w-[140px] h-7 px-2 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#09090b] font-mono text-xs text-neutral-900 dark:text-neutral-100"
          />
          <button
            type="submit"
            className="h-7 px-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 font-mono text-[11px] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Queue Line {queuedCount > 0 ? `(${queuedCount})` : ''}
          </button>
        </form>
      )}

      {/* Waiting stdin indicator in interactive mode */}
      {status === 'waiting_stdin' && isolated && (
        <div className="px-3 py-1 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-[11px] font-mono">
          Waiting for input() - type directly in the terminal below and press Enter (Ctrl+D for EOF, Ctrl+C to cancel).
        </div>
      )}

      {/* xterm container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-1.5"
        aria-label="Interactive Python terminal"
      />

      {/* Footer notice + screen-reader status */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0d0d0f] font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
        <span>
          {status === 'loading'
            ? 'Loading terminal Pyodide worker…'
            : status === 'running'
              ? 'Executing…'
              : `Ready (${isolated ? 'SharedArrayBuffer interactive stdin + Ctrl+C' : 'Queued stdin mode'})`}
        </span>
        <span>Terminal sessions do not affect grading · Stop resets REPL memory</span>
      </div>
      <p role="status" className="visually-hidden">
        {liveStatusMsg}
      </p>
    </div>
  );
}
