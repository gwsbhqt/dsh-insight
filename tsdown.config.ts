/**
 * dsh-insight 构建配置。host 半：ESM/node，@deepseek-ai/* 与 js-yaml 全部 external
 * （运行时由 profile 的 node_modules / $DSH_HOME/profiles/node_modules 解析）。
 * client 半：closure-factory CJS/browser，产物形状是模块表的唯一契约：
 *   window.__ModuleLoader__.load({ id, factory: (require) => { ...CJS...; return module.exports } })
 * tailwind 虚拟模块插件与纯度闸门镜像自 self-evolution ui-plugins/ipython-ui。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { defineConfig } from 'tsdown'

/**
 * 插件 id：模块表的键、`<style data-plugin>` 标签名。**必须等于 package.json 的
 * name**——官方自己的 bundle 也是这么发的（`id: "@deepseek-ai/dsh-client-modules"`），
 * client-modules 用包名做行键：「a plugin bundle IS its package's client half」。
 * 所以直接读 package.json，不再手写一份会跟着改名漂移的副本。
 */
const ID: string = JSON.parse(readFileSync('package.json', 'utf8')).name

/**
 * Tailwind 产物的虚拟模块说明符。**不许以 `.css` 结尾**——rolldown 会按后缀
 * 把它判成 CSS 资源拆进 lib/client.css，client.js 里就没有样式了。
 */
const TAILWIND_MODULE = 'virtual:tailwind-css'
const TAILWIND_OUT = 'lib/tailwind.css'

/** 浏览器冻结模块表的白名单；表外一律内联。与 dsh packages/client/web/src/platform.ts 同步。 */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
  '@deepseek-ai/dsh-client-runtime/client',
]

let css = ''

function compileTailwind(minify: boolean): string {
  execFileSync(
    './node_modules/.bin/tailwindcss',
    ['-i', 'src/client/tailwind.css', '-o', TAILWIND_OUT, ...(minify ? ['--minify'] : [])],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  const out = readFileSync(TAILWIND_OUT, 'utf8')
  rmSync(TAILWIND_OUT, { force: true })
  return out
}

const MINIFY = process.env.NODE_ENV !== 'development'

const tailwindPlugin = {
  name: 'tailwind',
  buildStart() {
    css = compileTailwind(MINIFY)
  },
  resolveId(source: string) {
    return source === TAILWIND_MODULE ? `\0${TAILWIND_MODULE}` : null
  },
  load(id: string) {
    return id === `\0${TAILWIND_MODULE}` ? `export default ${JSON.stringify(css)}` : null
  },
}

const purityGate = {
  name: 'purity-gate',
  resolveId(source: string) {
    if (!source.startsWith('@deepseek-ai/')) return null
    if (PLATFORM_MODULES.includes(source)) return null
    throw new Error(
      `client bundle purity: "${source}" 不在平台模块表——跨插件值导入禁止；` +
      '协作走 cordis 服务（类型导入会被擦除，到不了这里）',
    )
  },
}

export default defineConfig([
  {
    name: 'host',
    entry: { index: 'src/host/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    target: 'es2022',
    dts: false,
    sourcemap: false,
    fixedExtension: false,
    external: [/^@deepseek-ai\//, 'js-yaml'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    },
  },
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    dts: false,
    sourcemap: true,
    clean: false,
    fixedExtension: false,
    external: PLATFORM_MODULES,
    noExternal: (id: string) => (PLATFORM_MODULES.includes(id) ? undefined : true),
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      // 客户端拿不到 package.json，从构建期注入——否则包名会有第二份手抄件跟着漂移
      __PLUGIN_ID__: JSON.stringify(ID),
    },
    plugins: [purityGate, tailwindPlugin],
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      footer: 'return module.exports; } });',
    },
  },
])
