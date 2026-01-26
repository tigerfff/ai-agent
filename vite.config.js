import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue2(),
    {
      name: 'fix-crypto-bundle',
      transform(code, id) {
        if (id.includes('crypto.common.js')) {
          // 1. 声明原本缺失的隐式全局变量
          // 2. 模拟 CommonJS 环境 (module/exports)
          // 3. 将结果作为 ESM 默认导出
          return {
            code: `
              var _keyStr, _utf8_encode, _utf8_decode;
              var module = { exports: {} };
              var exports = module.exports;
              
              (function() {
                ${code}
              }).call(window);
              
              export default module.exports;
              export const sm4 = module.exports.sm4;
            `,
            map: null
          }
        }
      }
    }
  ],

  // 本地开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/v1': {
        target: 'https://pbchain.hik-cloud.com',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/v1')
      },
      '/api': {
        target: 'https://pbchain.hik-cloud.com',
        changeOrigin: true,
        rewrite: (path) => {
          // /api/inspect/... 或 /api/enterprise/... 保持不变
          // 如果路径是 /api/v1/...，则去掉 /api，保留 /v1
          if (path.startsWith('/api/v1')) {
            return path.replace(/^\/api/, '');
          }
          // 其他情况：/api/inspect/... -> /v1/inspect/...
          return path.replace(/^\/api/, '/v1');
        },
        secure: false
      },
      // 3. 保留 /api 配置 (如果还有其他接口用这个)
      '/AiApi': {
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
        secure: false,
        timeout: 10 * 60 * 1000, // 设置代理转发超时 (10分钟)
        proxyTimeout: 10 * 60 * 1000, // 设置代理响应超时
      },
      // 4. 代理图片资源请求 (pbpic.hik-cloud.com)
      '/pbpic': {
        target: 'https://pbpic.hik-cloud.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/pbpic/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 设置请求头以绕过防盗链
            proxyReq.setHeader('Referer', 'https://pbpic.hik-cloud.com');
            proxyReq.setHeader('Origin', 'https://pbpic.hik-cloud.com');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            // 移除可能被服务器拒绝的请求头
            proxyReq.removeHeader('x-forwarded-host');
            proxyReq.removeHeader('x-forwarded-proto');
          });
        }
      },
      // 5. 代理 /safe-center 开头的请求到 pbnissan.hik-cloud.com
      '/safe-center': {
        target: 'https://pbnissan.hik-cloud.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/safe-center/, '/v1'),
        headers: {
          Referer: 'https://pbnissan.hik-cloud.com'
        }
      }
    }
  },

  // 路径别名
  resolve: {
    alias: {
      // 源码别名
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 静态资源别名
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      '@svg': fileURLToPath(new URL('./src/assets/svg', import.meta.url)),
      // Hui UI 资源，从 public/hui2.43.2 下引入
      'hui': resolve(__dirname, 'public/hui2.43.2'),
      '@hcu': resolve(__dirname, 'public/hik-cloud-ui'),
      'sec-crypto': resolve(__dirname, 'src/utils/oss/crypto.common.js'),
    }
  },

  // 组件库打包配置：用于被父项目以 lib 形式引用
  build: {
    // 输出目录从默认的 dist 改为 lib，更符合库的命名习惯
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      // UMD 全局变量名（给直接用 <script> 的场景），可以用更语义化的名字
      name: 'HikCloudAgentX',
      // 生成 hik-cloud-agentX.es.js / hik-cloud-agentX.umd.js
      fileName: (format) => `hik-cloud-agentX.${format}.js`
    },
    // 样式处理：将所有样式打包到一个文件
    cssCodeSplit: false,
    rollupOptions: {
      // 外部依赖：由父项目提供，不打进库里
      external: ['vue', 'hui','hui/lib/hui.css','moment', 'lodash', '@hui/lib/hui.esm-browser.js', '@hui/lib/hui.css'],
      output: {
        globals: {
          vue: 'Vue'
        },
        // 样式文件命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return assetInfo.name;
        }
      }
    }
  }
})
