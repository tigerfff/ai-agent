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
      // 1. 直接代理 /v1 开头的请求 (用于 SSE 和新改的接口)
      '/v1': {
        target: 'https://pbsse.hik-cloud.com',
        changeOrigin: true,
        secure: false,
        headers: {
          Referer: 'https://pbsse.hik-cloud.com'
        }
      },
      // 2. 代理 /AIApi 开头的请求 (兼容原项目接口风格)
      // 假设原项目 /AIApi 映射到后端的 /v1
      '/AIApi': {
        target: 'https://pbsse.hik-cloud.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/AIApi/, '/v1'),
        secure: false
      },
      // 3. 保留 /api 配置 (如果还有其他接口用这个)
      '/api': {
        target: 'https://pbsse.hik-cloud.com',
        changeOrigin: true,
        rewrite: (path) => {
          // 针对 /api/v1/... 的情况，只需去掉 /api，保留 /v1
          if (path.startsWith('/api/v1')) {
            return path.replace(/^\/api/, '');
          }
          // 其他 /api/... 替换为 /v1/...
          return path.replace(/^\/api/, '/v1');
        },
        secure: false
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
