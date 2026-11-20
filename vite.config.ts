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

export default defineConfig({
  plugins: [react(), tailwindcss(), pyodideAssetsPlugin()],
  optimizeDeps: {
    exclude: ['pyodide'],
  },
  worker: {
    format: 'es',
  },
});
