# dsh-insight M2 实施计划：插件树

> **For agentic workers:** 按任务序执行；每任务结束跑通其测试再进下一个。步骤用 `- [x]` 勾掉。

**Goal:** 交付 `plugins/tree` 端到端——host 从 `ctx.loader` 实况采集插件树（状态徽章 + 失败原因 + 来源层 + 磁盘路径），client 加第四个 tab 懒展开树。

**Architecture:** host 新增 `tree.ts` 采集器挂进现有 RPC 路由；client 新增 `PluginsTreeView.tsx` 复用 Task 7 的 `useRpc` 与 tab 容器。全部样式走已有 Tailwind token。

## Global Constraints

- 沿用 M0+M1 计划的约束：双产物构建、虚拟 CSS 模块桩、`server.deps.inline`。
- `FiberState` 是 `const enum`，不要 import（isolatedModules 风险）；用数字字面量 + 注释映射。
- 采集全部 try/catch 包裹：单个 entry 的异常不能拖垮整棵树。

## 探活结论（已验证，不阻塞）

- `Entry.id`：嵌套 id 用 `EntryTree.sep`（`:`）拼接，如 `include:llm`。
- `Entry.options`：`{id, name, config?, group?, disabled?, inject?}`；`Entry.disabled` 是含父级传递的有效值（表达式已求值）。
- `Entry.fiber?.state`：0 PENDING / 1 LOADING / 2 ACTIVE / 3 FAILED / 4 DISPOSED / 5 UNLOADING。FAILED 时错误在 `fiber._error`（私有字段，运行时读取需 cast）。
- `Entry.subtree`：容器 entry（如 `include`）的子树；`entries()` 已递归拍平，层级靠 id 前缀重建。
- 磁盘路径：`createRequire(profileRoot).resolve(name + '/package.json')` 推出包目录（M0 已验证此手法）。

### Task 1: shared 类型 + host/tree.ts 采集器

**Files:** Create: `src/host/tree.ts`；Modify: `src/shared/types.ts`

`shared/types.ts` 追加：

```ts
export type PluginNodeState = 'active' | 'disabled' | 'pending' | 'loading' | 'failed' | 'disposed'

/** 插件树节点（plugins/tree 端点）。 */
export interface PluginNode {
  /** 完整嵌套 id（EntryTree.sep 拼接）。 */
  id: string
  /** 最后一段短 id。 */
  shortId: string
  /** 模块说明符（EntryOptions.name）。 */
  name: string
  /** 容器节点（group 行或带 subtree）。 */
  group: boolean
  /** 有效 disabled（含父级传递、表达式已求值）。 */
  disabled: boolean
  state: PluginNodeState
  /** state === 'failed' 时填。 */
  error?: { message: string; stack?: string }
  /** 来源层 label（重放命中的第一层），运行时动态注册的没有。 */
  origin?: string
  /** 包磁盘目录（解析得到的话）。 */
  path?: string
  children: PluginNode[]
}
```

`src/host/tree.ts`：

- `collectTree(ctx, opts: { originOf(id: string): string | undefined; resolvePath(name: string): string | undefined })`: 遍历 `ctx.loader.entries()` 逐 entry 建节点：
  - `shortId` = id 最后一段；`group` = `options.group || entry.subtree !== undefined`。
  - `disabled` 有效值优先：disabled → state `'disabled'`，不读 fiber。
  - 否则按 `fiber.state` 映射：2→active、3→failed（读 `_error`）、0→pending、1→loading、4/5→disposed；无 fiber → pending。
  - 单个 entry 读取异常 → 节点保留、state failed、error 记采集异常。
- 层级重建：`children` 按 id 前缀挂在最长已见前缀下，无父则挂根。
- 导出纯函数 `buildTree(nodes: PluginNode[]): PluginNode[]` 便于测试。

### Task 2: tree.ts 采集测试（真 cordis + loader 起小树）

**Files:** Create: `tests/tree.spec.ts` + `tests/fixtures/` 两个插件文件

- fixture `ok-plugin.js`：空 apply；`fail-plugin.js`：apply 抛错；`pending` 用 `inject: ['不存在的service']` 的 entry。
- 测试起 `new Context()` + 挂 loader 插件，`loader.create()` 三条 entry（fixture 用绝对路径 specifier），`await` 等沉降后 `collectTree`，断言 active/failed/pending 三态与 error.message。
- `buildTree` 单测：拍平列表 → 正确嵌套。
- 若 loader 在裸 Context 里起不来（依赖文件持久化），降级方案：mock 最小 Entry 形状断言 collectTree 映射逻辑 + buildTree 单测——在测试注释里记录原因。

### Task 3: RPC 接线 + 来源/路径解析

**Files:** Modify: `src/host/rpc.ts`、`src/host/index.ts`（inject 不变）

- `plugins/tree` producer：
  - `originOf`：`replayLayers(layersOf(ctx))` 的 hits——id 首次出现的层 label。
  - `resolvePath`：`createRequire(join(home, 'profiles', profileName, 'noop.js')).resolve(name + '/package.json')` → dirname，try/catch 返回 undefined。
  - home/profileName 复用 rpc.ts 现有的 `layersOf` 同款逻辑（抽小 helper 避免重复）。

### Task 4: client 插件树 tab

**Files:** Create: `src/client/components/PluginsTreeView.tsx`；Modify: `src/client/components/InsightSection.tsx`

- `PluginTreeView({ tree }: { tree: PluginNode[] })`：递归渲染，每行一个 `<details>`（有 children 时）或 `<div>`（叶子）：
  - 行：`shortId`（等宽）+ name 小字 + 状态徽章 + origin/path 小字。
  - 徽章配色：active=text-ok、disabled=text-tertiary、pending/loading=text-warn、failed=text-err；`bg-surface-2` 底。
  - failed 行内嵌 error.message + 可展开 stack（再一层 `<details>`）。
- InsightSection 加第四个 tab `{ id: 'plugins', label: '插件树' }`，endpoint `'plugins/tree'`，复用 useRpc。

### Task 5: 构建 + 全量测试 + commit

`pnpm run check` 全绿后：

```bash
git add -A && git commit --no-verify -m "feat: M2 插件树（host 采集 + client 第四 tab）"
```

### Task 6: M2 端到端验收与收尾

- 重启 dev profile insight（3082），无头 Chrome 验收清单：
  - 插件树 tab 列出真实插件，dsh-insight 行 active。
  - 已知 disabled 插件（如 hmr）显示 disabled 徽章。
  - 容器（include）可展开看到子节点。
  - 来源标注与分层合并 tab 的命中对得上。
  - 暗色主题正常；控制台无 JS 报错。
- README 状态行改 `> 状态：M2 插件树可用（M3 归因溯源未开始）。`
- commit `docs: M2 验收收尾`。

## 后续计划（不在本计划内）

- M3 归因溯源：溯源 drawer、Settings 实况 tab、能力清单（见设计文档 §8）。
