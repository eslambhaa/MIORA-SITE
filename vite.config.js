import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Content Security Policy for production builds only (the dev server needs
// inline scripts for hot reload). Only our own files, Supabase and two player hosts are allowed.
function contentSecurityPolicy(supabaseUrl) {
  const supabase = supabaseUrl ? new URL(supabaseUrl) : null
  const connect = ["'self'"]
  const images = ["'self'", 'data:']
  if (supabase) {
    connect.push(supabase.origin, `wss://${supabase.host}`)
    images.push(supabase.origin) // private profile pictures (signed URLs)
  }
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    `img-src ${images.join(' ')}`,
    "font-src 'self'",
    `connect-src ${connect.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Video and podcast players: only these two hosts, and only after a visitor presses play.
    'frame-src https://www.youtube-nocookie.com https://embed.podcasts.apple.com',
  ].join('; ')
  return {
    name: 'miora-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
    ],
  }
}

// Preload the Arabic Almarai files (regular + bold) so text does not jump
// when the font arrives. Their hashed names are only known after bundling.
function preloadFonts() {
  return {
    name: 'miora-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        const files = Object.keys(bundle ?? {}).filter((name) => /almarai-arabic-(400|700)-normal-.*\.woff2$/.test(name))
        return files.map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head',
        }))
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_SUPABASE_URL), preloadFonts()],
    build: {
      rolldownOptions: {
        output: {
          // Libraries change rarely: separate files stay cached between our updates.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
              { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            ],
          },
        },
      },
    },
  }
})
