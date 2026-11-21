import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Serves node_modules/pyodide at /pyodide/ during dev and copies it to
 * dist/pyodide/ during build so core Python runs 100% offline on localhost.
 */
function pyodideAssetsPlugin(): Plugin {
  const pyodideDir = path.resolve(__dirname, 'node_modules/pyodide');

  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.zip': 'application/zip',
  };

  return {
    name: 'pyodide-local-assets',
    configureServer(server) {
      server.middlewares.use('/pyodide', (req, res, next) => {
        const cleanUrl = (req.url ?? '/').split('?')[0];
        const filePath = path.join(pyodideDir, cleanUrl);
        // Prevent path traversal outside node_modules/pyodide
        if (!filePath.startsWith(pyodideDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next();
          return;
        }
        const ext = path.extname(filePath);
        res.setHeader('Content-Type', mimeTypes[ext] ?? 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      });
    },
    writeBundle(options) {
      const outDir = options.dir ? path.resolve(options.dir, 'pyodide') : path.resolve(__dirname, 'dist/pyodide');
      fs.mkdirSync(outDir, { recursive: true });
      for (const entry of fs.readdirSync(pyodideDir)) {
        if (entry.endsWith('.mjs') || entry.endsWith('.js') || entry.endsWith('.wasm') || entry.endsWith('.zip') || entry.endsWith('.json')) {
          fs.copyFileSync(path.join(pyodideDir, entry), path.join(outDir, entry));
        }
      }
    },
  };
}

/**
 * Exposes stripped problem metadata eagerly at virtual:problems-meta so the
 * /problems list page never bundles hidden tests, statements, or solutions.
 */
function problemsMetadataPlugin(): Plugin {
  const virtualId = 'virtual:problems-meta';
  const resolvedVirtualId = `\0${virtualId}`;
  const problemsDir = path.resolve(__dirname, 'src/content/problems');

  function readAllMeta() {
    if (!fs.existsSync(problemsDir)) return [];
    const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
    const items = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const jsonPath = path.join(problemsDir, entry.name, 'problem.json');
      if (!fs.existsSync(jsonPath)) continue;
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      items.push({
        folder: entry.name,
        id: parsed.id,
        slug: parsed.slug,
        title: parsed.title,
        difficulty: parsed.difficulty,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        estimatedMinutes: parsed.estimatedMinutes ?? 15,
        relatedModules: Array.isArray(parsed.relatedModules) ? parsed.relatedModules : [],
        sources: Array.isArray(parsed.sources) ? parsed.sources : [],
        visibleCount: Array.isArray(parsed.tests?.visible) ? parsed.tests.visible.length : 0,
        hiddenCount: Array.isArray(parsed.tests?.hidden) ? parsed.tests.hidden.length : 0,
      });
    }
    return items.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }

  return {
    name: 'problems-metadata-virtual',
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    load(id) {
      if (id === resolvedVirtualId) {
        return `export default ${JSON.stringify(readAllMeta())};`;
      }
    },
    configureServer(server) {
      server.watcher.add(problemsDir);
      const invalidate = (filePath: string) => {
        if (!filePath.startsWith(problemsDir)) return;
        const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }
      };
      server.watcher.on('add', invalidate);
      server.watcher.on('change', invalidate);
      server.watcher.on('unlink', invalidate);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pyodideAssetsPlugin(), problemsMetadataPlugin()],
  optimizeDeps: {
    exclude: ['pyodide'],
  },
  worker: {
    format: 'es',
  },
});
