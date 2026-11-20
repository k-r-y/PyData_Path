import { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

type FormMode = 0 | 1 | 2;

const FORM_LABELS: Record<FormMode, { fig: string; title: string; mode: string }> = {
  0: { fig: 'FIG. 01', title: 'TORUS KNOT (2,3) / CLICK TO MORPH', mode: 'MODE 01 / PARTICLE GEOMETRY' },
  1: { fig: 'FIG. 02', title: 'LORENZ ATTRACTOR / CLICK TO MORPH', mode: 'MODE 02 / CHAOS MANIFOLD' },
  2: { fig: 'FIG. 03', title: 'LISSAJOUS KNOT / CLICK TO MORPH', mode: 'MODE 03 / HARMONIC LATTICE' },
};

interface Point3D {
  x: number;
  y: number;
  z: number;
  shade: number;
}

function generatePoints(mode: FormMode, count = 1600): Point3D[] {
  const pts: Point3D[] = [];

  if (mode === 0) {
    // Stippled Torus Knot (p=2, q=3) with volumetric tube thickness
    const p = 2;
    const q = 3;
    for (let i = 0; i < count; i++) {
      const u = (i / count) * Math.PI * 2;
      const v = ((i * 137.508) % 360) * (Math.PI / 180);
      const r = 0.95 + 0.38 * Math.cos(q * u);
      const cx = r * Math.cos(p * u);
      const cy = r * Math.sin(p * u);
      const cz = 0.45 * Math.sin(q * u);

      // Tube offset
      const tubeR = 0.24 * Math.sqrt(((i * 73) % 100) / 100);
      const x = cx + tubeR * Math.cos(v) * Math.cos(p * u);
      const y = cy + tubeR * Math.cos(v) * Math.sin(p * u);
      const z = cz + tubeR * Math.sin(v);
      pts.push({ x, y, z, shade: (Math.sin(v) + 1) * 0.5 });
    }
  } else if (mode === 1) {
    // Lorenz Attractor
    let lx = 0.1;
    let ly = 0;
    let lz = 0;
    const dt = 0.008;
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    for (let i = 0; i < 120; i++) {
      const dx = sigma * (ly - lx);
      const dy = lx * (rho - lz) - ly;
      const dz = lx * ly - beta * lz;
      lx += dx * dt;
      ly += dy * dt;
      lz += dz * dt;
    }
    for (let i = 0; i < count; i++) {
      const dx = sigma * (ly - lx);
      const dy = lx * (rho - lz) - ly;
      const dz = lx * ly - beta * lz;
      lx += dx * dt;
      ly += dy * dt;
      lz += dz * dt;
      pts.push({
        x: lx * 0.055,
        y: ly * 0.055,
        z: (lz - 25) * 0.055,
        shade: (i % 10) / 10,
      });
    }
  } else {
    // Lissajous 3D harmonic knot
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const jitter = (((i * 29) % 100) / 100 - 0.5) * 0.14;
      const x = Math.sin(3 * t + 0.4) * 1.1 + jitter;
      const y = Math.sin(4 * t) * 1.1 + jitter;
      const z = Math.sin(5 * t + 0.8) * 0.85 + jitter;
      pts.push({ x, y, z, shade: (Math.cos(5 * t) + 1) * 0.5 });
    }
  }

  return pts;
}

export function ParticleKnot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<FormMode>(0);
  const { resolvedTheme } = useTheme();
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, rotX: 0.45, rotY: 0.35, vx: 0, vy: 0 });
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = generatePoints(mode);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const d = dragRef.current;
      if (!d.active) {
        if (!reducedMotion) {
          d.rotY += 0.0035 + d.vx * 0.04;
          d.rotX += d.vy * 0.04;
          d.vx *= 0.92;
          d.vy *= 0.92;
        }
      }

      const cosY = Math.cos(d.rotY);
      const sinY = Math.sin(d.rotY);
      const cosX = Math.cos(d.rotX);
      const sinX = Math.sin(d.rotX);

      const scale = Math.min(w, h) * 0.27;
      const cx = w * 0.52;
      const cy = h * 0.48;
      const isDark = resolvedTheme === 'dark';

      // Project & depth-sort
      const projected = points.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const perspective = 3.2 / (3.2 - z2);
        let sx = cx + x1 * scale * perspective;
        let sy = cy + y2 * scale * perspective;

        if (pointerRef.current.active) {
          const dx = sx - pointerRef.current.x;
          const dy = sy - pointerRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 72 && dist > 0.1) {
            const force = (1 - dist / 72) * 14;
            sx += (dx / dist) * force;
            sy += (dy / dist) * force;
          }
        }

        return { sx, sy, z: z2, shade: p.shade };
      });

      projected.sort((a, b) => a.z - b.z);

      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        const depthAlpha = Math.max(0.14, Math.min(0.92, (pt.z + 1.4) / 2.6));
        const radius = pt.z > 0.2 ? 1.45 : 1.05;
        ctx.fillStyle = isDark
          ? `rgba(245, 245, 245, ${depthAlpha.toFixed(2)})`
          : `rgba(12, 12, 14, ${depthAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [mode, resolvedTheme]);

  const meta = FORM_LABELS[mode];

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[360px] lg:min-h-[440px] select-none">
      {/* Top technical figure caption */}
      <div className="flex items-center justify-between gap-4 px-5 pt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-neutral-400 dark:text-neutral-500">
        <span>{meta.fig} — {meta.title}</span>
        <span className="hidden sm:inline">{meta.mode}</span>
      </div>

      {/* Interactive Canvas */}
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D particle geometry visualization. Click to morph form or drag to rotate."
        onClick={() => setMode((m) => ((m + 1) % 3) as FormMode)}
        onPointerDown={(e) => {
          dragRef.current.active = true;
          dragRef.current.lastX = e.clientX;
          dragRef.current.lastY = e.clientY;
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          pointerRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            active: true,
          };
          if (dragRef.current.active) {
            const dx = e.clientX - dragRef.current.lastX;
            const dy = e.clientY - dragRef.current.lastY;
            dragRef.current.rotY += dx * 0.008;
            dragRef.current.rotX += dy * 0.008;
            dragRef.current.vx = dx * 0.08;
            dragRef.current.vy = dy * 0.08;
            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;
          }
        }}
        onPointerUp={() => {
          dragRef.current.active = false;
        }}
        onPointerLeave={() => {
          dragRef.current.active = false;
          pointerRef.current.active = false;
        }}
        className="w-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Bottom right caption */}
      <div className="flex items-center justify-end px-5 pb-3 font-mono text-[10px] tracking-[0.14em] uppercase text-neutral-400 dark:text-neutral-500">
        <span>03 FORMS · DRAG CURSOR TO DISPLACE</span>
      </div>
    </div>
  );
}
