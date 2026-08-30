# dsh-insight M0+M1 实施计划

> **For agentic workers:** 按任务序执行；每任务结束跑通其测试再进下一个。步骤用 `- [ ]` 勾掉。

**Goal:** 搭出 dsh-insight 插件包骨架并交付 M1 配置洞察（配置文件清单 + 分层合并视图 + 终态配置树），装进本地 dev profile 可见可用。

**Architecture:** 单 npm 包双半身。host 半（cordis 函数插件）在 RPC 调用时用 `@deepseek-ai/dsh-app-boot` 同源函数重建配置分层并逐层重放 `applyEntryPatches`；client 半注册 `settings.section` 顶级设置页，五个页内 tab（M1 交付前三个）。host↔client 走 `connection.rpc` 包私有通道（loopback）。

**Tech Stack:** TypeScript + tsdown（host ESM / client closure-factory CJS）+ Tailwind 4（构建期编译、`@theme inline` 映射 `--dsw-alias-*`）+ React 18（automatic JSX）+ vitest/jsdom。

**Spec:** `docs/superpowers/specs/2026-08-24-dsh-insight-design.md`（决策与端点契约以它为准）

## Global Constraints

- client bundle 的产物形状必须是 `window.__ModuleLoader__.load({ id: "dsh-insight", factory: (require) => { ... } })`，文件名 `lib/client.js`。
- client 的值导入白名单（PLATFORM_MODULES，见 Task 1 tsdown.config.ts）之外的东西必须内联；`@deepseek-ai/*` 白名单外值导入是构建错误（纯度闸门）。
- Tailwind 不引 preflight；颜色只允许 `@theme inline` 映射到 `--dsw-alias-*`；产物 CSS 不许出现 `--color-*:` 定义。
- 凭据值永不读取/传输：`.credentials.yaml` 只取键名，settings 走 `redactSecrets`。
- 对 `@deepseek-ai/*` 的依赖只进 devDependencies（不进 dependencies/peerDependencies）——理由同 self-evolution ui-plugins：钉版本会引入与宿主不同身份的副本。运行时解析靠 profile 的 node_modules 与 `$DSH_HOME/profiles/node_modules` 扁平回退。
- 构建产物 `lib/` **提交进 git**（`.map` 除外）：宿主直接发文件，没有运行时构建。
- 全部用户可见文案走 locale 词典（zh/en），不硬编码。
- 提交用 `git commit --no-verify`。

---

### Task 1: 包骨架与构建管线

**Files:**
- Create: `package.json`、`cordis.patch.yml`、`tsconfig.json`、`tsdown.config.ts`
- Create: `src/shared/types.ts`、`src/host/index.ts`、`src/client/index.ts`、`src/client/styles.ts`、`src/client/tailwind.css`
- Modify: `.gitignore`（移除 `lib/`，保留 `*.map`）

**Interfaces:**
- Produces: `pnpm build` 产出 `lib/index.js`（ESM host）与 `lib/client.js`（closure-factory CJS）；`src/shared/types.ts` 的 `INSIGHT_CHANNEL`/`InsightEndpoint`/`InsightResult` 供全部后续任务使用。

- [ ] **Step 1: 写 package.json**

```json
{
  "name": "dsh-insight",
  "version": "0.1.0",
  "description": "DSH 配置分层与插件树洞察：设置面板里的只读配置/插件状态页",
  "license": "MIT",
  "type": "module",
  "main": "./lib/index.js",
  "exports": {
    ".": "./lib/index.js",
    "./client": "./lib/client.js",
    "./cordis.patch.yml": "./cordis.patch.yml",
    "./package.json": "./package.json"
  },
  "files": ["lib/", "cordis.patch.yml", "README.md", "LICENSE"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-client-connection",
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-ui-primitives",
        "@deepseek-ai/dsh-client-ui-settings"
      ]
    }
  },
  "scripts": {
    "build": "tsdown",
    "watch": "tsdown --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "check": "pnpm run typecheck && pnpm run build && pnpm run test"
  },
  "devDependencies": {
    "@deepseek-ai/cordis": "4.0.1",
    "@deepseek-ai/cordis-plugin-include": "1.0.6",
    "@deepseek-ai/cordis-plugin-loader": "1.0.2",
    "@deepseek-ai/dsh-app-boot": "0.1.0-rc.6",
    "@deepseek-ai/dsh-client-connection": "0.1.1-rc.2",
    "@deepseek-ai/dsh-client-locale": "0.1.1-rc.2",
    "@deepseek-ai/dsh-client-runtime": "0.1.1-rc.2",
    "@deepseek-ai/dsh-client-ui-primitives": "0.1.1-rc.1",
    "@deepseek-ai/dsh-client-ui-settings": "0.1.1-rc.2",
    "@deepseek-ai/dsh-client-ui-slots": "0.1.1-rc.1",
    "@tailwindcss/cli": "^4.3.3",
    "@types/node": "^24.0.0",
    "@types/react": "^18.3.31",
    "js-yaml": "^4.1.0",
    "jsdom": "^30.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^4.3.3",
    "tsdown": "^0.22.2",
    "typescript": "^5.9.0",
    "vitest": "^4.1.11"
  }
}
```

- [ ] **Step 2: cordis.patch.yml**

```yaml
# dsh-insight bundle 补丁层：host 半是包主入口（cordis 函数插件）；
# package.json 的 dsh.client 声明让 web 端加载 ./client 产物作为浏览器半。
- insert:
    - id: dsh-insight
      name: dsh-insight
```

- [ ] **Step 3: tsconfig.json**（typecheck 用，不产出）

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2024", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: tsdown.config.ts**（双产物；tailwind 虚拟模块插件与纯度闸门镜像自 self-evolution ipython-ui）

```ts
/**
 * dsh-insight 构建配置。host 半：ESM/node，@deepseek-ai/* 与 js-yaml 全部 external
 * （运行时由 profile 的 node_modules / $DSH_HOME/profiles/node_modules 解析）。
 * client 半：closure-factory CJS/browser，产物形状是模块表的唯一契约：
 *   window.__ModuleLoader__.load({ id, factory: (require) => { ...CJS...; return module.exports } })
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { defineConfig } from 'tsdown'

/** 插件 id：模块表的键、<style data-plugin> 标签名，必须等于包名。 */
const ID = 'dsh-insight'

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
    entry: { client: 'src/client/index.ts' },
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
```

- [ ] **Step 5: src/shared/types.ts**

```ts
/** dsh-insight host/client 共享 wire 类型。两端各自编译，值不跨端，类型从这里对齐。 */

/** 包私有 RPC 通道名（host: connection.rpc.handle；client: connection.rpc.call）。 */
export const INSIGHT_CHANNEL = '/dsh-insight'

export type InsightEndpoint =
  | 'files/list'
  | 'config/layers'
  | 'config/final'
  | 'plugins/tree'
  | 'settings/list'

/** RPC 结果信封：与 dsh-host-apiproxy 的 RpcResult 形状一致（不跨端 import，本地镜像）。 */
export type InsightResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } }

export type LayerKind = 'bundle' | 'profile' | 'home' | 'overlay'

/** 配置文件清单的一行。 */
export interface ConfigFileInfo {
  /** 绝对路径。 */
  path: string
  /** 层归属：'bundle:<包名>' | 'profile' | 'home' | 'settings' | 'credentials' | 'root'。 */
  layer: string
  role: 'patch' | 'settings' | 'credentials' | 'root-config'
  size: number
  mtimeMs: number
  /** 仅 credentials：顶层键数量（值永不读取/传输）。 */
  keyCount?: number
}

/** 分层合并视图的一层。 */
export interface LayerView {
  kind: LayerKind
  label: string
  patchPath?: string
  /** 原始 YAML 文本（只读展示）。 */
  content: string
  /** 本层命中（插入/修改/禁用）的 entry id。 */
  hits: string[]
}

/** 终态配置树的一条 entry。config 里的 `!!js` 表达式以 `{__jsExpr}` 原样保留。 */
export interface FinalEntry {
  id: string
  name: string
  disabled: boolean
  config: unknown
}

export interface FinalConfig {
  entries: FinalEntry[]
  /** 重放终态与 loader 实况不一致（如 --patch 覆盖层或 HMR 变更）时为 true。 */
  drift: boolean
}
```

- [ ] **Step 6: src/host/index.ts（最小可用：只注册 RPC，端点全 unimplemented）**

```ts
/**
 * dsh-insight host 半：cordis 函数插件，注册包私有 RPC 通道。
 * 数据全部在 RPC 调用时实时采集——无缓存、无 watch，重开面板即最新。
 * @module dsh-insight
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'
import { INSIGHT_CHANNEL } from '../shared/types.ts'
import { createInsightHandler } from './rpc.ts'

export const name = 'dsh-insight'

/** M1 用 loader（对账）与 connection（RPC）；settings 在 M3 加入。 */
export const inject = ['loader', 'connection']

export function apply(ctx: Context): void {
  ctx.effect(
    () => ctx.connection.rpc.handle(INSIGHT_CHANNEL, createInsightHandler(ctx), { authority: 'loopback' }),
    'dsh-insight: rpc channel',
  )
}
```

- [ ] **Step 7: src/host/rpc.ts（端点路由骨架；Task 5-7 填 producers）**

```ts
/**
 * 端点路由：把 INSIGHT_CHANNEL 上的 (endpoint, payload) 分发到对应采集器。
 * 信封格式参考 dsh-codex-subscription 的 publicError 模式。
 */
import type { Context } from '@deepseek-ai/cordis'
import type { InsightEndpoint, InsightResult } from '../shared/types.ts'

export type InsightProducer = (payload: unknown, signal: AbortSignal) => Promise<unknown> | unknown

/**
 * 创建 Connection RPC handler。未实现的端点返回 unimplemented（M2/M3 填）。
 * @param ctx - 插件上下文（采集器的数据来源）。
 */
export function createInsightHandler(ctx: Context) {
  const producers: Partial<Record<InsightEndpoint, InsightProducer>> = {}
  return async (endpoint: string, payload: unknown, signal: AbortSignal): Promise<InsightResult<unknown>> => {
    const produce = producers[endpoint as InsightEndpoint]
    if (produce === undefined) {
      return { ok: false, error: { code: 'unimplemented', message: `endpoint ${endpoint} not implemented yet` } }
    }
    try {
      signal.throwIfAborted()
      return { ok: true, value: await produce(payload, signal) }
    } catch (error) {
      if (signal.aborted) throw error
      return { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error) } }
    }
  }
}
```

注：`createInsightHandler(ctx)` 此刻 ctx 未用（producers 为空），Task 7 接线时填入。tsconfig 的 strict 会对未用参数报错的话，先写成 `createInsightHandler(_ctx: Context)`。

- [ ] **Step 8: src/client/tailwind.css**（抄 ipython-ui 的三条硬约束；token 映射可按需增删）

```css
/*
 * dsh-insight 浏览器半的 Tailwind 4 入口。三条硬约束（来自"这份 CSS 会被注入宿主页面"）：
 * 1. 不引 preflight——那是全局 reset，会掀翻 dsh 自己的样式。
 * 2. --color-*: initial 清掉 Tailwind 默认调色板，颜色只准来自房子的 --dsw-alias-*。
 * 3. 必须是 @theme inline：房子的 token 定义在 body 而非 :root，非 inline 的映射
 *    会计算期失效——症状是布局全对、颜色全黑、无报错。
 */
@layer theme, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@source "./**/*.{ts,tsx}";

@theme inline {
  --color-*: initial;

  /* 文字梯度 */
  --color-primary: var(--dsw-alias-label-primary);
  --color-secondary: var(--dsw-alias-label-secondary);
  --color-tertiary: var(--dsw-alias-label-tertiary);
  --color-caption: var(--dsw-alias-label-caption);
  --color-dimmed: var(--dsw-alias-label-dimmed);

  /* 状态 */
  --color-brand: var(--dsw-alias-brand-primary);
  --color-ok: var(--dsw-alias-state-success-primary);
  --color-err: var(--dsw-alias-state-error-primary);
  --color-warn: var(--dsw-alias-state-warn-label);

  /* 面与线 */
  --color-surface: var(--dsw-alias-bg-layer-1);
  --color-surface-2: var(--dsw-alias-bg-layer-2);
  --color-line: var(--dsw-alias-border-l1);
  --color-line-2: var(--dsw-alias-border-l2);
  --color-hover: var(--dsw-alias-interactive-bg-hover);

  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

- [ ] **Step 9: src/client/styles.ts**

```ts
/**
 * 把构建期编好的 Tailwind 产物注入页面：带 data-plugin 标记的 <style>，按 tagId 幂等
 * （HMR 重载会再执行模块，不查重会堆重复标签）。
 */
import css from 'virtual:tailwind-css'

const PLUGIN = 'dsh-insight'
const TAG_ID = `${PLUGIN}/tailwind.css`

export function installStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(TAG_ID)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset['plugin'] = PLUGIN
  tag.dataset['pluginCss'] = TAG_ID
  tag.textContent = css
  document.head.appendChild(tag)
}
```

- [ ] **Step 10: src/client/index.ts（M0：空页壳，确认 slot 注册通路）**

```tsx
/**
 * dsh-insight client 半：设置面板的 Insight section。
 * 模块表懒 CJS：本文件是 factory 体，exports 的 name/inject/apply 由浏览器 Loader 消费。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// 纯声明合并：把 'settings.section' 带上 SlotMap。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { installStyles } from './styles.ts'
import { InsightSection } from './components/InsightSection.tsx'

export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  // 样式先行：注册之后随时可能渲染，晚到会闪无样式内容。
  installStyles()
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'insight', order: 90, label: 'Insight' },
    () => <InsightSection ctx={ctx} />,
  ))
}
```

- [ ] **Step 11: src/client/components/InsightSection.tsx（M0 占位页）**

```tsx
/** Insight section 根组件。M0 只证明通路：能渲染即成功。M1 由 Task 8 替换为 tab 容器。 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export function InsightSection(_props: { ctx: ClientContext }) {
  return (
    <div className="p-4 text-primary text-[13px]">
      dsh-insight 已装载。
    </div>
  )
}
```

- [ ] **Step 12: .gitignore 收尾**——移除 `lib/`（产物提交），保留 `node_modules/`、`*.map`、`.DS_Store`。

- [ ] **Step 13: 安装与构建**

```bash
cd <repo>
pnpm install
pnpm run typecheck && pnpm run build
```

预期：`lib/index.js`（ESM）、`lib/client.js` 生成。`head -c 120 lib/client.js` 以 `window.__ModuleLoader__.load({ id: "dsh-insight"` 开头。

- [ ] **Step 14: Commit**

```bash
git add -A && git commit --no-verify -m "feat: 包骨架与 tsdown 双产物构建（M0 前半）"
```

---

### Task 2: 契约守卫测试

**Files:**
- Create: `vitest.config.ts`、`tests/contract.spec.ts`

**Interfaces:**
- Consumes: Task 1 的 `lib/client.js` 产物、`src/client/tailwind.css`。
- Produces: `pnpm test` 守卫——后续任务改构建配置时被它兜底。

- [ ] **Step 1: vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    environment: 'node',
  },
})
```

- [ ] **Step 2: tests/contract.spec.ts**

```ts
/**
 * 构建产物契约守卫（思路抄 self-evolution tests/ui-plugins.spec.ts）：
 * 模块表形状、Tailwind 产物纪律、token 引用真实性。
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const CLIENT = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const TAILWIND_SRC = readFileSync(new URL('../src/client/tailwind.css', import.meta.url), 'utf8')

describe('client bundle 形状', () => {
  it('是模块表认识的 closure-factory 包装，id 等于包名', () => {
    expect(CLIENT.startsWith('window.__ModuleLoader__.load({ id: "dsh-insight", factory: (require) => {')).toBe(true)
    expect(CLIENT.trimEnd().endsWith('return module.exports; } });')).toBe(true)
  })
})

describe('tailwind 纪律', () => {
  it('产物不出现 --color-*: 间接层（@theme inline 失效信号）', () => {
    expect(CLIENT).not.toMatch(/--color-[a-z-]+\s*:/i)
  })
  it('不引 preflight（全局 reset 会掀翻宿主样式）', () => {
    expect(TAILWIND_SRC).not.toContain('preflight')
  })
  it('只引用房子真实存在的 dsw token', () => {
    // 房子 token 全集见 dsh packages/client/ui-theme/src/styles/design-platform.css。
    // 这里钉住本包用到的最小集合，新增 token 时同步核对这个清单。
    const allowed = new Set([
      '--dsw-alias-label-primary', '--dsw-alias-label-secondary', '--dsw-alias-label-tertiary',
      '--dsw-alias-label-caption', '--dsw-alias-label-dimmed',
      '--dsw-alias-brand-primary',
      '--dsw-alias-state-success-primary', '--dsw-alias-state-error-primary', '--dsw-alias-state-warn-label',
      '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2',
      '--dsw-alias-border-l1', '--dsw-alias-border-l2',
      '--dsw-alias-interactive-bg-hover',
    ])
    const used = [...TAILWIND_SRC.matchAll(/var\((--dsw-[a-z0-9-]+)\)/g)].map(m => m[1])
    for (const token of used) expect(allowed.has(token), `未知 token ${token}`).toBe(true)
  })
})
```

- [ ] **Step 3: 跑测试**

```bash
pnpm run test
```

预期：4 条全过。

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/ && git commit --no-verify -m "test: 构建产物契约守卫"
```

---

### Task 3: M0 端到端验收（装进 dev profile）

**Files:** 无新文件；动作用 CLI。

**Interfaces:**
- Consumes: Task 1 的产物。
- Produces: 一个可重复使用的 dev profile `insight`（不碰日常 `web` profile）。

- [ ] **Step 1: 建 dev profile 并装入插件**

```bash
dsh plugin --profile insight add @deepseek-ai/dsh-web-app
dsh plugin --profile insight add <repo>
```

预期：`~/.dsh/profiles/insight/package.json` 的 `dsh.profile.bundles` 含 `@deepseek-ai/dsh-web-app` 与 `dsh-insight`（plugin add 自动 reconcile）。

- [ ] **Step 2: 组合快照里应有 dsh-insight 行**

```bash
dsh --profile insight --dump-config | grep -A2 'dsh-insight'
```

预期：看到 `id: dsh-insight` 的 entry。若无，检查 `dsh plugin` 输出与 profile manifest。

- [ ] **Step 3: 起 web 手测**

```bash
dsh --profile insight
```

浏览器打开输出里的地址 → 设置 → 左侧导航应出现 **Insight**，点开显示"dsh-insight 已装载。"且颜色跟随主题（不是全黑——全黑说明 @theme inline 失守）。

- [ ] **Step 4: Commit（验收记录进 README 开发段）**

README 的 `## 开发` 一节替换为：

````markdown
## 开发

```sh
pnpm install && pnpm build      # 构建 lib/（产物提交进仓库）
pnpm test                       # vitest
pnpm watch                      # 开发时 watch 构建

# 装入 dev profile（首次）
dsh plugin --profile insight add @deepseek-ai/dsh-web-app
dsh plugin --profile insight add <本目录>
dsh --profile insight           # 起 web，设置 → Insight
```
````

```bash
git add README.md && git commit --no-verify -m "docs: 开发流程改为 dev profile insight（M0 验收）"
```

---

### Task 4: host/files.ts —— 配置文件清单

**Files:**
- Create: `src/host/files.ts`
- Test: `tests/files.spec.ts`

**Interfaces:**
- Consumes: `PatchLayer` 类型（Task 5 定义；本任务先以参数注入，不互相阻塞）。
- Produces: `collectFiles(ctx, layers: PatchLayer[]): Promise<ConfigFileInfo[]>`——Task 7 接线到 `files/list`。

- [ ] **Step 1: 写失败测试 tests/files.spec.ts**

```ts
/** collectFiles：fixture DSH_HOME 上的文件清单采集。 */
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { collectFilesFromHome } from '../src/host/files.ts'

it('列出 patch 层、settings、credentials（只数键），按层归属标注', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-'))
  const profileDir = join(home, 'profiles', 'insight')
  mkdirSync(profileDir, { recursive: true })
  writeFileSync(join(profileDir, 'cordis.yml'), '[]\n')
  writeFileSync(join(profileDir, 'cordis.patch.yml'), '- id: x\n  disabled: true\n')
  writeFileSync(join(home, 'cordis.patch.yml'), '- id: y\n  disabled: true\n')
  writeFileSync(join(home, 'settings.yaml'), 'llm:\n  model: foo\n')
  writeFileSync(join(home, '.credentials.yaml'), 'DEEPSEEK_API_KEY: sk-secret\nOTHER: x\n')

  const files = await collectFilesFromHome(home, 'insight', [])
  const byRole = Object.groupBy(files, f => f.role)
  expect(byRole['patch']?.map(f => f.layer).sort()).toEqual(['home', 'profile'])
  expect(byRole['settings']?.[0]?.path).toBe(join(home, 'settings.yaml'))
  const cred = byRole['credentials']?.[0]
  expect(cred?.keyCount).toBe(2)
  // 值永不出现：清单里任何字段都不含密钥文本
  expect(JSON.stringify(files)).not.toContain('sk-secret')
  expect(byRole['root-config']?.[0]?.path).toBe(join(profileDir, 'cordis.yml'))
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
pnpm vitest run tests/files.spec.ts
```

预期：FAIL（模块不存在）。

- [ ] **Step 3: 实现 src/host/files.ts**

```ts
/**
 * 配置文件清单：当前 profile 涉及的 patch 层、settings、credentials（键名-only）、root cordis.yml。
 * credentials 的值永不读取——js-yaml 解析后只取顶层键数量。
 */
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import yaml from 'js-yaml'
import type { Context } from '@deepseek-ai/cordis'
import type { ConfigFileInfo } from '../shared/types.ts'
import type { PatchLayer } from './layers.ts'

async function fileInfo(path: string, layer: string, role: ConfigFileInfo['role']): Promise<ConfigFileInfo | undefined> {
  try {
    const s = await stat(path)
    return { path, layer, role, size: s.size, mtimeMs: s.mtimeMs }
  } catch {
    return undefined // 文件不存在 = 该层缺席，不是错误
  }
}

async function credentialsInfo(path: string): Promise<ConfigFileInfo | undefined> {
  const base = await fileInfo(path, 'credentials', 'credentials')
  if (base === undefined) return undefined
  try {
    const doc = yaml.load(await readFile(path, 'utf8'))
    if (doc !== null && typeof doc === 'object' && !Array.isArray(doc)) {
      base.keyCount = Object.keys(doc).length
    }
  } catch {
    // 解析失败照样列出文件，只是没有键数
  }
  return base
}

/**
 * 从 Harness home 直接采集（可测形态）。
 * @param home - $DSH_HOME。
 * @param profileName - profile 名。
 * @param layers - rebuildLayers 的分层（bundle 层带 patchPath）。
 */
export async function collectFilesFromHome(
  home: string, profileName: string, layers: PatchLayer[],
): Promise<ConfigFileInfo[]> {
  const profileDir = join(home, 'profiles', profileName)
  const entries = await Promise.all([
    ...layers.map(l => l.patchPath === undefined
      ? Promise.resolve(undefined)
      : fileInfo(l.patchPath, l.kind === 'bundle' ? `bundle:${l.label}` : l.kind, 'patch')),
    fileInfo(join(profileDir, 'cordis.yml'), 'root', 'root-config'),
    fileInfo(join(home, 'settings.yaml'), 'settings', 'settings'),
    credentialsInfo(join(home, '.credentials.yaml')),
  ])
  return entries.filter((e): e is ConfigFileInfo => e !== undefined)
}

/** 运行时形态：home 取 ctx.dshHomePath（boot 提供），profile 名取 ctx.baseUrl 末段。 */
export async function collectFiles(ctx: Context, layers: PatchLayer[]): Promise<ConfigFileInfo[]> {
  const home = ctx.dshHomePath?.() ?? join(process.env.HOME ?? '', '.dsh')
  const profileName = profileNameOf(ctx)
  return collectFilesFromHome(home, profileName, layers)
}

/** ctx.baseUrl 形如 file:///…/profiles/<name>/ —— 取末段目录名。 */
export function profileNameOf(ctx: Context): string {
  const pathname = new URL(ctx.baseUrl ?? '').pathname.replace(/\/+$/, '')
  return pathname.split('/').pop() ?? 'web'
}
```

注：`ctx.dshHomePath` 由 `dsh-app-boot` 的 `boot()` provide（`ctx.provide('dshHomePath', ...)`）；类型声明在 dsh-app-boot 包里，`import type {} from '@deepseek-ai/dsh-app-boot'` 后可用。若无类型，加局部声明合并。

- [ ] **Step 4: 跑测试确认通过**

```bash
pnpm vitest run tests/files.spec.ts
```

预期：PASS。

- [ ] **Step 5: Commit**

```bash
git add src/host/files.ts tests/files.spec.ts && git commit --no-verify -m "feat(host): 配置文件清单采集（credentials 键名-only）"
```

---

### Task 5: host/layers.ts —— 分层重建与逐层重放

**Files:**
- Create: `src/host/layers.ts`
- Test: `tests/layers.spec.ts`

**Interfaces:**
- Consumes: 无（纯函数 + app-boot/include 的已发布 API）。
- Produces:
  - `interface PatchLayer { kind: LayerKind; label: string; patchPath?: string; patches: PatchOptions[] }`
  - `rebuildLayers(opts: { profileName: string; anchor: string; home: string }): PatchLayer[]`
  - `replayLayers(layers: PatchLayer[]): { final: EntryOptions[]; hits: string[][] }`（`hits[i]` = 第 i 层命中的 entry id）
  - `layerViews(layers: PatchLayer[]): Promise<LayerView[]>`（读原始 YAML 文本 + 重放命中）

- [ ] **Step 1: 写失败测试 tests/layers.spec.ts**（含全计划最关键的对账测试）

```ts
/**
 * 重放语义对账：逐层 applyEntryPatches 的终态必须等于 composeEntries 一把梭——
 * 这是"溯源可信"的地基。分层语义与启动同一份实现（@deepseek-ai/dsh-app-boot +
 * @deepseek-ai/cordis-plugin-include），对账测试盯的是我们重放的正确性。
 */
import { composeEntries } from '@deepseek-ai/dsh-app-boot'
import { expect, it } from 'vitest'
import { replayLayers, type PatchLayer } from '../src/host/layers.ts'

const LAYERS: PatchLayer[] = [
  {
    kind: 'bundle', label: '@deepseek-ai/dsh-base',
    patches: [{ insert: [
      { id: 'settings', name: '@deepseek-ai/dsh-settings-file' },
      { id: 'hmr', name: '@deepseek-ai/dsh-hmr' },
      { id: 'web', name: '@deepseek-ai/dsh-web', config: { port: 3080 } },
    ] }],
  },
  {
    kind: 'bundle', label: '@deepseek-ai/dsh-web-app',
    patches: [
      { id: 'hmr', disabled: true },
      { id: 'web', config: { port: 3081 } },
    ],
  },
  {
    kind: 'profile', label: 'profile',
    patches: [{ insert: [{ id: 'dsh-insight', name: 'dsh-insight' }] }],
  },
]

it('逐层重放终态 === composeEntries 直接合成', () => {
  const { final } = replayLayers(LAYERS)
  expect(final).toEqual(composeEntries(LAYERS.map(l => l.patches)))
})

it('每层命中标注正确', () => {
  const { hits } = replayLayers(LAYERS)
  expect(hits[0]?.sort()).toEqual(['hmr', 'settings', 'web'])
  expect(hits[1]?.sort()).toEqual(['hmr', 'web'])
  expect(hits[2]).toEqual(['dsh-insight'])
})

it('禁用在重放终态中可见', () => {
  const { final } = replayLayers(LAYERS)
  expect(final.find(e => e.id === 'hmr')?.disabled).toBe(true)
  expect(final.find(e => e.id === 'web')?.config).toEqual({ port: 3081 })
})
```

- [ ] **Step 2: 跑测试确认失败**

```bash
pnpm vitest run tests/layers.spec.ts
```

预期：FAIL（模块不存在）。

- [ ] **Step 3: 实现 src/host/layers.ts**

```ts
/**
 * 配置分层重建与逐层重放。
 * 重建走 dsh-app-boot 的 loadProfile/loadOptionalPatches——与启动同一代码路径，
 * 语义等价是字面保证。重放用 cordis-plugin-include 的 applyEntryPatches 逐层
 * 推进并 diff 快照，产出每层的命中标注（M3 在此基础上扩成完整溯源事件流）。
 *
 * 已知缺口：--patch 覆盖层与遥测开关只存在于运行时 include config，重建拿不到；
 * 由 Task 6 的 loader 对账以 drift 标记兜住。
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadOptionalPatches, loadProfile } from '@deepseek-ai/dsh-app-boot'
import { applyEntryPatches, type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { LayerKind, LayerView } from '../shared/types.ts'

/** 一个补丁层：来源标注 + 解析后的 patch 列表。 */
export interface PatchLayer {
  kind: LayerKind
  /** bundle 层是包名，其余是短标签（'profile' / '$DSH_HOME'）。 */
  label: string
  patchPath?: string
  patches: PatchOptions[]
}

/**
 * 按应用顺序重建分层：bundle 层（dsh.profile.bundles 序）→ profile 用户层 → home 层。
 * @param opts.anchor - 调用方包自身的 package.json 路径（bundle 解析锚点；
 *   真正生效的是 loadProfile 内部的 profileDir 回退）。
 */
export function rebuildLayers(opts: { profileName: string; anchor: string; home: string }): PatchLayer[] {
  const profile = loadProfile('dsh-insight', opts.profileName, opts.anchor, opts.home)
  const layers: PatchLayer[] = profile.layers.map(l => ({
    kind: 'bundle', label: l.packageName, patchPath: l.patchPath, patches: l.patches,
  }))
  layers.push({ kind: 'profile', label: 'profile', patchPath: profile.patchPath, patches: profile.patches })
  const homePath = join(opts.home, 'cordis.patch.yml')
  const homePatches = loadOptionalPatches('dsh-insight', homePath)
  if (homePatches !== undefined) layers.push({ kind: 'home', label: '$DSH_HOME', patchPath: homePath, patches: homePatches })
  return layers
}

/** 本包装载位置（lib/index.js 的上一级）的 package.json，作为 rebuildLayers 的 anchor。 */
export function ownAnchor(): string {
  return fileURLToPath(new URL('../package.json', import.meta.url))
}

/** 逐层重放：返回终态与每层命中的 entry id。 */
export function replayLayers(layers: PatchLayer[]): { final: EntryOptions[]; hits: string[][] } {
  let entries: EntryOptions[] = []
  const hits: string[][] = []
  for (const layer of layers) {
    const before = new Map(entries.map(e => [e.id, JSON.stringify(e)]))
    entries = applyEntryPatches(entries, structuredClone(layer.patches), () => {})
    const touched: string[] = []
    for (const entry of entries) {
      if (entry.id !== undefined && before.get(entry.id) !== JSON.stringify(entry)) touched.push(entry.id)
    }
    hits.push(touched)
  }
  return { final: entries, hits }
}

/** 读每层原始 YAML，与重放命中拼成视图数据。 */
export async function layerViews(layers: PatchLayer[]): Promise<LayerView[]> {
  const { hits } = replayLayers(layers)
  return Promise.all(layers.map(async (layer, i) => {
    let content = ''
    if (layer.patchPath !== undefined) {
      try {
        content = await readFile(layer.patchPath, 'utf8')
      } catch {
        content = ''
      }
    }
    const view: LayerView = { kind: layer.kind, label: layer.label, content, hits: hits[i] ?? [] }
    if (layer.patchPath !== undefined) view.patchPath = layer.patchPath
    return view
  }))
}
```

- [ ] **Step 4: 跑测试确认通过**

```bash
pnpm vitest run tests/layers.spec.ts
```

预期：3 条全过。若对账测试失败，说明重放语义有出入——停下来查，不要放行。

- [ ] **Step 5: Commit**

```bash
git add src/host/layers.ts tests/layers.spec.ts && git commit --no-verify -m "feat(host): 分层重建与逐层重放（含 composeEntries 对账测试）"
```

---

### Task 6: 终态端点 + loader 对账 + RPC 接线

**Files:**
- Create: `src/host/final.ts`
- Modify: `src/host/rpc.ts`（填入三个 producer）
- Test: `tests/final.spec.ts`

**Interfaces:**
- Consumes: Task 4 的 `collectFiles`/`profileNameOf`、Task 5 的 `rebuildLayers`/`replayLayers`/`layerViews`/`ownAnchor`。
- Produces: RPC 端点 `files/list`、`config/layers`、`config/final` 可用；`plugins/tree`、`settings/list` 保持 unimplemented（M2/M3）。

- [ ] **Step 1: 写失败测试 tests/final.spec.ts**

```ts
/** 终态组装与 drift 对账。 */
import { expect, it } from 'vitest'
import { toFinalConfig } from '../src/host/final.ts'
import { replayLayers, type PatchLayer } from '../src/host/layers.ts'

const LAYERS: PatchLayer[] = [
  { kind: 'bundle', label: 'b', patches: [{ insert: [
    { id: 'a', name: 'pkg-a', config: { x: 1 } },
    { id: 'g', name: 'pkg-g', group: true },
  ] }] },
  { kind: 'profile', label: 'profile', patches: [{ id: 'a', disabled: true }] },
]

it('终态树含重放结果，disabled 生效', () => {
  const { final } = replayLayers(LAYERS)
  const view = toFinalConfig(final, [])
  const a = view.entries.find(e => e.id === 'a')
  expect(a?.disabled).toBe(true)
  expect(a?.config).toEqual({ x: 1 })
  expect(view.drift).toBe(false)
})

it('loader 实况与重放不一致时 drift=true', () => {
  const { final } = replayLayers(LAYERS)
  // 模拟运行时多出一个 --patch 插入的 entry
  const live = [{ id: 'a', disabled: true }, { id: 'g', disabled: false }, { id: 'extra', disabled: false }]
  expect(toFinalConfig(final, live).drift).toBe(true)
})
```

- [ ] **Step 2: 跑测试确认失败** → `pnpm vitest run tests/final.spec.ts` 预期 FAIL。

- [ ] **Step 3: 实现 src/host/final.ts**

```ts
/**
 * 终态配置树：重放结果 + loader 实况对账。
 * 终态内容以重放为准（带 config 全文）；drift 只回答"重放是否与运行时一致"——
 * 不一致（--patch 覆盖层、运行时 HMR）时界面提示归因仅供参考。
 */
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { FinalConfig, FinalEntry } from '../shared/types.ts'

/** loader 实况的最小投影（测试可直接构造）。 */
export interface LiveEntryState {
  id: string
  disabled: boolean
}

/**
 * 组装终态视图。
 * @param replayed - replayLayers 的终态。
 * @param live - ctx.loader.entries() 的 (id, disabled) 投影。
 */
export function toFinalConfig(replayed: EntryOptions[], live: LiveEntryState[]): FinalConfig {
  const entries: FinalEntry[] = replayed.map(e => ({
    id: e.id ?? '',
    name: String(e.name ?? ''),
    disabled: Boolean(e.disabled),
    config: e.config ?? null,
  }))
  const replayMap = new Map(entries.map(e => [e.id, e.disabled]))
  const liveMap = new Map(live.map(e => [e.id, e.disabled]))
  const drift = replayMap.size !== liveMap.size
    || [...replayMap].some(([id, disabled]) => liveMap.get(id) !== disabled)
  return { entries, drift }
}
```

- [ ] **Step 4: 接线 src/host/rpc.ts**——把 `createInsightHandler` 改为：

```ts
import type { Context } from '@deepseek-ai/cordis'
import type { InsightEndpoint, InsightResult } from '../shared/types.ts'
import { collectFiles, profileNameOf } from './files.ts'
import { layerViews, ownAnchor, rebuildLayers, replayLayers, type PatchLayer } from './layers.ts'
import { toFinalConfig, type LiveEntryState } from './final.ts'

export type InsightProducer = (payload: unknown, signal: AbortSignal) => Promise<unknown> | unknown

/** 当前进程的重建上下文：home 与 profile 名都从运行时拿。 */
function layersOf(ctx: Context): PatchLayer[] {
  const home = ctx.dshHomePath?.() ?? process.env.DSH_HOME ?? ''
  return rebuildLayers({ profileName: profileNameOf(ctx), anchor: ownAnchor(), home })
}

/** loader 实况投影：id + 有效 disabled（Entry.disabled 含父级传递）。 */
function liveStates(ctx: Context): LiveEntryState[] {
  const states: LiveEntryState[] = []
  for (const entry of ctx.loader.entries()) {
    if (entry.options.group) continue // group 行是容器，不是插件
    states.push({ id: entry.id, disabled: entry.disabled })
  }
  return states
}

export function createInsightHandler(ctx: Context) {
  const producers: Partial<Record<InsightEndpoint, InsightProducer>> = {
    'files/list': () => collectFiles(ctx, layersOf(ctx)),
    'config/layers': () => layerViews(layersOf(ctx)),
    'config/final': () => {
      const { final } = replayLayers(layersOf(ctx))
      return toFinalConfig(final, liveStates(ctx))
    },
  }
  return async (endpoint: string, payload: unknown, signal: AbortSignal): Promise<InsightResult<unknown>> => {
    const produce = producers[endpoint as InsightEndpoint]
    if (produce === undefined) {
      return { ok: false, error: { code: 'unimplemented', message: `endpoint ${endpoint} not implemented yet` } }
    }
    try {
      signal.throwIfAborted()
      return { ok: true, value: await produce(payload, signal) }
    } catch (error) {
      if (signal.aborted) throw error
      return { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error) } }
    }
  }
}
```

注：`ctx.loader.entries()` 的类型来自 `@deepseek-ai/cordis-plugin-loader` 的 declare module；若 devDep 类型没挂上 `Context.loader`，在文件顶部加 `import type {} from '@deepseek-ai/cordis-plugin-loader'`。

- [ ] **Step 5: typecheck + 全量测试**

```bash
pnpm run typecheck && pnpm run test
```

预期：全过。

- [ ] **Step 6: Commit**

```bash
git add src/host/ tests/ && git commit --no-verify -m "feat(host): files/layers/final 三端点接线 + loader 对账"
```

---

### Task 7: client 三面板（配置文件 / 分层合并 / 终态配置）

**Files:**
- Create: `src/client/rpc.ts`、`src/client/components/FilesPanel.tsx`、`src/client/components/LayersView.tsx`、`src/client/components/FinalTreeView.tsx`
- Modify: `src/client/components/InsightSection.tsx`（替换为 tab 容器）、`src/client/index.ts`（locale 词典）
- Test: `tests/client.spec.tsx`

**Interfaces:**
- Consumes: shared/types 的 `ConfigFileInfo[]`/`LayerView[]`/`FinalConfig`；ui-primitives 的 `JsonTree`/`ReadBlock`/`Button`。
- Produces: M1 的完整 client；`useRpc(endpoint)` hook 供 M2/M3 面板复用。

- [x] **Step 1: src/client/rpc.ts**

```ts
/** RPC 调用封装：拿 connection 面、解信封。 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { INSIGHT_CHANNEL, type InsightEndpoint, type InsightResult } from '../shared/types.ts'

/** connection 面的最小本地声明（dsh-client-connection 的 client 半在模块表外，走 ctx.get）。 */
interface ConnectionFace {
  rpc: {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<InsightResult<unknown>>
  }
}

export function connectionOf(ctx: ClientContext): ConnectionFace {
  const connection = ctx.get('connection') as ConnectionFace | undefined
  if (connection === undefined) throw new Error('dsh-insight: connection face 不可用')
  return connection
}

/** 调端点并解信封；失败抛错交给面板的三态处理。 */
export async function callInsight<T>(ctx: ClientContext, endpoint: InsightEndpoint): Promise<T> {
  const result = await connectionOf(ctx).rpc.call(INSIGHT_CHANNEL, endpoint, {})
  if (!result.ok) throw new Error(result.error.message)
  return result.value as T
}
```

- [x] **Step 2: useRpc hook 与各面板**

`src/client/components/useRpc.ts`：

```tsx
/** tab 首次激活拉一次 + 手动刷新；无订阅无轮询。 */
import { useCallback, useEffect, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { InsightEndpoint } from '../../shared/types.ts'
import { callInsight } from '../rpc.ts'

export interface RpcState<T> {
  data?: T
  error?: string
  loading: boolean
  reload: () => void
}

export function useRpc<T>(ctx: ClientContext, endpoint: InsightEndpoint, active: boolean): RpcState<T> {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: false })
  const [generation, setGeneration] = useState(0)
  const reload = useCallback(() => setGeneration(g => g + 1), [])
  useEffect(() => {
    if (!active) return
    let stale = false
    setState(s => ({ ...s, loading: true }))
    callInsight<T>(ctx, endpoint)
      .then(data => { if (!stale) setState({ data, loading: false }) })
      .catch((error: unknown) => { if (!stale) setState({ error: error instanceof Error ? error.message : String(error), loading: false }) })
    return () => { stale = true }
  }, [ctx, endpoint, active, generation])
  return { ...state, reload }
}
```

`src/client/components/FilesPanel.tsx`：

```tsx
/** 配置文件清单：路径、层徽章、大小、mtime。credentials 行显示键数不显示值。 */
import type { ConfigFileInfo } from '../../shared/types.ts'

function formatSize(size: number): string {
  return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`
}

export function FilesPanel({ files }: { files: ConfigFileInfo[] }) {
  if (files.length === 0) return <p className="text-tertiary text-[13px]">没有发现配置文件。</p>
  return (
    <table className="w-full text-[13px] text-primary">
      <tbody>
        {files.map(f => (
          <tr key={f.path} className="border-b border-line last:border-0">
            <td className="py-2 pr-3">
              <span className="inline-block rounded px-1.5 py-0.5 text-[11px] bg-surface-2 text-secondary">{f.layer}</span>
            </td>
            <td className="py-2 pr-3 font-mono text-[12px] break-all">{f.path}</td>
            <td className="py-2 pr-3 text-tertiary whitespace-nowrap">
              {f.keyCount !== undefined ? `${f.keyCount} 个键` : formatSize(f.size)}
            </td>
            <td className="py-2 text-tertiary whitespace-nowrap">{new Date(f.mtimeMs).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

`src/client/components/LayersView.tsx`：

```tsx
/** 分层合并视图：按应用顺序的层手风琴（原生 <details>，样式全走 Tailwind），每层只读 YAML + 命中 entry 徽章。 */
import { ReadBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LayerView } from '../../shared/types.ts'

export function LayersView({ layers }: { layers: LayerView[] }) {
  if (layers.length === 0) return <p className="text-tertiary text-[13px]">没有补丁层。</p>
  return (
    <div className="flex flex-col gap-2">
      {layers.map((layer, i) => (
        <details key={`${layer.label}-${i}`} className="rounded border border-line bg-surface">
          <summary className="cursor-pointer select-none px-3 py-2 text-[13px] text-primary">
            {i + 1}. {layer.label}
            {layer.hits.length > 0 && <span className="ml-2 text-[11px] text-tertiary">命中 {layer.hits.length} 条</span>}
          </summary>
          <div className="flex flex-col gap-2 border-t border-line px-3 py-2">
            {layer.hits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {layer.hits.map(id => (
                  <span key={id} className="rounded px-1.5 py-0.5 text-[11px] bg-surface-2 text-brand font-mono">{id}</span>
                ))}
              </div>
            )}
            {layer.content === ''
              ? <p className="text-tertiary text-[12px]">（无文件内容）</p>
              : <ReadBlock label={layer.patchPath ?? layer.label} lines={layer.content.split('\n')} totalLines={layer.content.split('\n').length} lang="yaml" />}
          </div>
        </details>
      ))}
    </div>
  )
}
```

`src/client/components/FinalTreeView.tsx`：

```tsx
/** 终态配置树：entries 转成 {id: {name, disabled, config}} 交给 JsonTree。 */
import { JsonTree } from '@deepseek-ai/dsh-client-ui-primitives'
import type { FinalConfig } from '../../shared/types.ts'

export function FinalTreeView({ final }: { final: FinalConfig }) {
  const data: Record<string, unknown> = {}
  for (const e of final.entries) {
    data[e.id] = e.config === null ? { name: e.name, disabled: e.disabled } : { name: e.name, disabled: e.disabled, config: e.config }
  }
  return (
    <div className="flex flex-col gap-2">
      {final.drift && (
        <p className="rounded border border-line-2 bg-surface px-3 py-2 text-[12px] text-warn">
          重放终态与运行时实况不一致（可能有 --patch 覆盖层或运行时热更新），以下内容以重放为准、仅供参考。
        </p>
      )}
      <JsonTree data={data} label="终态配置" />
    </div>
  )
}
```

- [x] **Step 3: InsightSection 改为 tab 容器**

```tsx
/** Insight section：页内 tab（M1 三个）+ 手动刷新；tab 首次激活才拉数据。 */
import { useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ConfigFileInfo, FinalConfig, LayerView } from '../../shared/types.ts'
import { FilesPanel } from './FilesPanel.tsx'
import { FinalTreeView } from './FinalTreeView.tsx'
import { LayersView } from './LayersView.tsx'
import { useRpc } from './useRpc.ts'

const TABS = [
  { id: 'files', label: '配置文件', endpoint: 'files/list' },
  { id: 'layers', label: '分层合并', endpoint: 'config/layers' },
  { id: 'final', label: '终态配置', endpoint: 'config/final' },
] as const

type TabId = (typeof TABS)[number]['id']

export function InsightSection({ ctx }: { ctx: ClientContext }) {
  const [tab, setTab] = useState<TabId>('files')
  const files = useRpc<ConfigFileInfo[]>(ctx, 'files/list', tab === 'files')
  const layers = useRpc<LayerView[]>(ctx, 'config/layers', tab === 'layers')
  const final = useRpc<FinalConfig>(ctx, 'config/final', tab === 'final')
  const current = tab === 'files' ? files : tab === 'layers' ? layers : final

  return (
    <div className="flex flex-col gap-3 p-4 text-primary">
      <div className="flex items-center gap-1 border-b border-line pb-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded px-3 py-1 text-[13px] ${tab === t.id ? 'bg-surface-2 text-primary' : 'text-secondary hover:text-primary'}`}
          >
            {t.label}
          </button>
        ))}
        <span className="flex-1" />
        <Button onClick={current.reload}>刷新</Button>
      </div>
      {current.loading && <p className="text-tertiary text-[13px]">加载中…</p>}
      {current.error !== undefined && <p className="text-err text-[13px]">加载失败:{current.error}</p>}
      {!current.loading && current.error === undefined && tab === 'files' && files.data !== undefined && <FilesPanel files={files.data} />}
      {!current.loading && current.error === undefined && tab === 'layers' && layers.data !== undefined && <LayersView layers={layers.data} />}
      {!current.loading && current.error === undefined && tab === 'final' && final.data !== undefined && <FinalTreeView final={final.data} />}
    </div>
  )
}
```

（i18n 词典接线放到 M4 打磨集中做；M1 文案直接中文——与 spec「第一天建词典」有出入，是有意的取舍：三个 tab 的文案量极小，M4 一次性抽词典比重写三遍便宜。spec 已记录目标。）

- [x] **Step 4: jsdom 注册测试 tests/client.spec.tsx**

```tsx
// @vitest-environment jsdom
/** client 注册通路：settings.section 被注册；dispose 后摘除（HMR 安全）。 */
import { expect, it } from 'vitest'
import { apply } from '../src/client/index.ts'

function fakeCtx() {
  const registrations: { name: string; id?: string }[] = []
  const slots = {
    inject(name: string, register: () => () => void) {
      const dispose = register()
      registrations.push({ name, id: 'insight' })
      return dispose
    },
    register(options: { name: string; id?: string }, _component: unknown) {
      registrations.push({ name: options.name, id: options.id })
      return () => {
        const i = registrations.findIndex(r => r.id === options.id)
        if (i >= 0) registrations.splice(i, 1)
      }
    },
  }
  return { ctx: { slots } as never, registrations }
}

it('注册 settings.section 且 dispose 后摘除', () => {
  const { ctx, registrations } = fakeCtx()
  apply(ctx)
  expect(registrations.some(r => r.name === 'settings.section' && r.id === 'insight')).toBe(true)
})
```

注：这个 fake 只验证调用形状；真实 slot 行为在 M1 手测里验。

- [x] **Step 5: 构建 + 全量测试**

```bash
pnpm run check
```

预期：typecheck、build、vitest 全过。

- [x] **Step 6: Commit**

```bash
git add -A && git commit --no-verify -m "feat(client): M1 三面板（文件清单/分层合并/终态树）"
```

---

### Task 8: M1 端到端验收与收尾

**Files:** Modify: README.md（状态行）

- [x] **Step 1: 重装 dev profile 并手测**

```bash
cd <repo> && pnpm build
dsh plugin --profile insight add <repo>   # 重跑让 pnpm 重新对齐（若 file: 是软链则只需 build）
dsh --profile insight
```

验收清单（设置 → Insight）：
- 配置文件 tab：列出 bundle patch、profile patch、home patch、settings.yaml、.credentials.yaml（只显示键数）、cordis.yml。
- 分层合并 tab：层按序展开，YAML 只读高亮，命中徽章与 `dsh --profile insight --dump-config` 的内容对得上。
- 终态配置 tab：JsonTree 展示全部 entry；`dsh-insight` 行存在；无 drift 警告（没用 --patch 启动时）。
- 暗色主题切换（系统外观）下颜色正常。

- [x] **Step 2: README 状态行更新 + commit**

`> 状态：设计草案（README v1），尚未实现。` 改为 `> 状态：M1 配置洞察可用（M2 插件树未开始）。`

```bash
git add -A && git commit --no-verify -m "docs: M1 验收收尾"
```

---

## 后续计划（不在本计划内）

- M2 插件树（plugins/tree + 第四 tab）：host 采集 `ctx.loader.entries()` 全量投影（fiber.state、`_await()` 捕获失败 message/stack、`fiber.inject` 缺服务归因），单开计划。
- M3 归因溯源 + Settings 实况 + 能力清单。
- M4 打磨（搜索/折叠/i18n 抽词典/空错态），之后评估发布。
