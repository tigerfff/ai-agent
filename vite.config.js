import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue2()],

  // 本地开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      // 开发环境下，将 /api 代理到 PB 网关（仅用于本项目调试）
      '/api': {
        target: 'https://pbchain.hik-cloud.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
        // 如遇到自签名证书问题，可打开下一行
        // secure: false,
      }
    }
  },

  // 路径别名
  resolve: {
    alias: {
      // 源码别名
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Hui UI 资源，从 public/hui2.43.2 下引入
      '@hui': resolve(__dirname, 'public/hui2.43.2')
    }
  },

  // 组件库打包配置：用于被父项目以 lib 形式引用
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'AIAA',
      fileName: (format) => `ai-aa.${format}.js`
    },
    rollupOptions: {
      // 外部依赖：由父项目提供，不打进库里
      external: ['vue', '@hui/lib/hui.esm-browser.js', '@hui/lib/hui.css'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})

