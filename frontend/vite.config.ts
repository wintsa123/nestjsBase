import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`, // 确保 @ 指向 src 目录
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/element-variables.scss" as * ;`,
      },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue', // 自动导入 vue 函数
        'vue-router', // 自动导入 vue-router 函数
        {
          'alova': ['createAlova'],
          'alova/client': ['useRequest', 'usePagination', 'useWatcher'],
          '@/api': ['Apis'],
        },
        {

          from: 'element-plus',
          imports: ['ElMessage', 'ElMessageBox']
        } // 从 element-plus 组件库中自动导入的函数
      ],
      dirs: [
        './src/stores/*.ts',
        './src/api'
      ], // 自动导入的全局文件
      eslintrc: {
        enabled: true, // 启用自动生成的 ESLint 配置
        // filepath: '.eslintrc-auto-import.json', // 自动生成的 ESLint 配置文件路径，可以手动设置存储位置，默认根目录下面。
        globalsPropValue: true, // 将自动导入的变量注册为全局
      }, // 保证自动导入的函数既不触发 ESLint 的 no-undef 报错，也拥有完善的类型提示。默认不配置的话不会生成类型声明文件。
    }),
    
  ],

  build: {

    minify: 'terser',  // 使用 Terser 压缩
    terserOptions: {
      compress: {
        drop_console: true, // 去掉 console.log
        drop_debugger: true, // 去掉 debugger
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 自定义代码分割逻辑
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name].[hash].js',   // JavaScript 文件
        chunkFileNames: 'assets/[name].[hash].js',   // 分块文件
        assetFileNames: 'assets/[name].[hash][extname]'  // 其他资源
      }
    }
  }

})