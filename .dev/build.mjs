// Rebuilds the overlay bundle:  npm run build  (from this folder)
import { build } from 'esbuild';
await build({
  entryPoints: ['agentation-entry.jsx'], bundle: true, minify: true, format: 'iife', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' }, outfile: 'agentation.bundle.js', logLevel: 'info',
});
