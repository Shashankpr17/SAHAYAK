import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin: emit a vercel.json inside dist/ for SPA fallback routing
function vercelSpaPlugin(): Plugin {
  return {
    name: 'vercel-spa-routing',
    generateBundle(_options, _bundle, isWrite) {
      if (isWrite) {
        this.emitFile({
          type: 'asset',
          fileName: 'vercel.json',
          source: JSON.stringify({
            rewrites: [{ source: '/(.*)', destination: '/index.html' }]
          }, null, 2)
        });
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelSpaPlugin()],
})
