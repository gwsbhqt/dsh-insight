import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/** 与 tsdown 同源：包名既是模块表的键，也是 <style data-plugin> 的标记。 */
const PLUGIN_ID: string = JSON.parse(readFileSync('package.json', 'utf8')).name

export default defineConfig({
  define: { __PLUGIN_ID__: JSON.stringify(PLUGIN_ID) },
  resolve: {
    alias: {
      // 构建期由 tsdown 注入的虚拟模块；测试用空产物桩。
      'virtual:tailwind-css': fileURLToPath(new URL('./tests/stubs/virtual-tailwind-css.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    environment: 'node',
    server: {
      deps: {
        // client 组件树会 import dsh 浏览器包（内含 CSS module），交给 vite 管线处理而非 node 原生加载。
        inline: [/@deepseek-ai\/dsh-client-/],
      },
    },
  },
})
