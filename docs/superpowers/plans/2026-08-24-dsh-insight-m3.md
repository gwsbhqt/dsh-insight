# dsh-insight M3 实施计划：归因溯源 + Settings 实况 + 能力清单

> **For agentic workers:** 按任务序执行；每任务结束跑通其测试再进下一个。

**Goal:** 终态配置的每条 entry 能回答"它从哪来、被谁改过"（跨层事件流）；新增 Settings 实况 tab；插件树节点带上能力（provides/requires），面板附全局工具表。

**Architecture:** 全部复用现有骨架——host 加采集/挂现有 RPC 路由，client 加面板/复用 useRpc 与 tab 容器。

## 探活结论（已验证，不阻塞）

- `ctx.settings.describe({ redactSecrets: true })` → `SettingsDescriptor[]`：`{ns, schema, value, revision, base?, user?, applies, secrets?}`，secret 位已从 value/base/user 剥离并枚举在 `secrets`（路径列表）。服务名 `settings`，需加进 host inject；类型包 `@deepseek-ai/dsh-settings@0.1.1-rc.2`（加 devDep 做类型对齐，运行时由 profile 提供）。
- `ctx.tools.schemas()` → `ToolSchema[]`（name + description 等），全局工具表来源；无 per-plugin 归因。
- 每插件能力：`fiber.store` 的键 = 该插件 provide 的服务（active 时）；`fiber.inject` 的键 = require 的服务。
- 事件监听存在 scope 级 `_hooks`，**无法反查 fiber**，逐插件事件归因不做（记录在案的取舍）。
- `EntryGroup.create` 对同步启动失败抛错回滚（M2 已记录）。

## 设计取舍（相对 spec §6 的偏离，有意为之）

- 溯源入口用**行内展开**而非"右侧抽屉"：JsonTree 不支持行点击回调，且设置面板宽度有限；每条 entry 行展开同时展示事件流 + 该 entry 的 config JsonTree。
- 能力清单中事件监听不做逐插件归因（cordis 无此反查）。
- ~~工具表~~（实施时砍掉）：工具注册按 agent scope 隔离在 ScopedLayers 里，`ctx.get('tools')` 拿到的是 scope 门面，`schemas()` 无 agent scope 时恒为 0，内部 layers 不可达——面板读取时刻没有 agent 上下文，做了也永远空白。能力清单只保留 per-plugin provides/requires。

### Task 1: 溯源事件流（host）

**Files:** Modify: `src/shared/types.ts`、`src/host/layers.ts`、`src/host/final.ts`；Test: `tests/layers.spec.ts` 扩

- shared 加 `AttributionEvent = { layer: string; kind: 'insert' | 'update' | 'disable' | 'enable' }`；`FinalEntry` 加 `events?: AttributionEvent[]`。
- `replayLayers` 返回值加 `events: Record<string, AttributionEvent[]>`：逐层 diff 时——before 无此 id → `insert`；`disabled` 翻转 → `disable`/`enable`；其余内容变化 → `update`。同层同 entry 只记一条。
- `toFinalConfig(replayed, live, events?)` 把 events 填进 FinalEntry。
- 测试：fixture 三层（插入 a → 改 config → disabled），断言事件序列与 kind 正确。

### Task 2: settings/list 端点（host）

**Files:** Modify: `src/host/index.ts`（inject 加 settings）、`src/host/rpc.ts`、`src/shared/types.ts`；Test: `tests/settings.spec.ts`

- shared 加 `SettingsView = { ns: string; value: unknown; base?: unknown; user?: unknown; applies: string; secrets: string[] }`。
- producer：`ctx.settings.describe({ redactSecrets: true })` 透传映射（丢 schema/revision——M3 只读展示用不到；secrets 归一成 string[]）。
- settings 服务缺席（如无 settings 的 profile）返回空数组而非报错。
- 测试：fake ctx 断言映射与缺席容错。

### Task 3: 能力清单（host）

**Files:** Modify: `src/host/tree.ts`、`src/shared/types.ts`、`src/host/rpc.ts`；Test: `tests/tree.spec.ts` 扩

- `PluginNode` 加 `provides?: string[]`、`requires?: string[]`（active fiber 的 store/inject 键，排序后给出）。
- wire 保持 `PluginNode[]` 不变。
- 测试：fake fiber 带 store/inject 断言 provides/requires。

### Task 4: client 三处改造

**Files:** Modify: `FinalTreeView.tsx`（改 entry 列表 + 行内展开）、`PluginsTreeView.tsx`（能力行 + 全局工具区块）、`InsightSection.tsx`（第五 tab）；Create: `SettingsView.tsx`

- **终态配置 tab**：改 entry 列表——每行 id + disabled 徽章；展开显示事件流时间线（`层label · kind` 序列）+ 该 entry config 的 JsonTree。drift 警告保留。
- **插件树 tab**：节点详情加 provides/requires 行（等宽小字 chips）。
- **Settings tab**：命名空间手风琴——ns 名 + applies 徽章 + user 覆盖徽章（`user !== undefined`）；展开后三段：`生效值`/`base`/`user` 各一个 JsonTree（base/user 缺省不渲染该段）；secrets 路径渲染为 `***` 徽章行。
- 全部沿用 token 配色，无新依赖。

### Task 5: 构建 + 全量测试 + commit

`pnpm run check` 全绿后 commit `feat: M3 归因溯源 + Settings 实况 + 能力清单`。

### Task 6: M3 端到端验收与收尾

- 重启 dev profile insight，无头 Chrome 清单：
  - 终态 tab：展开 `webserver` 行看到 `dsh-base 插入 → profile 覆盖` 类事件流；JsonTree 渲染 config。
  - Settings tab：列出真实命名空间；有用户覆盖的 ns 显示覆盖徽章；secret 位 `***`。
  - 插件树 tab：节点详情有 provides/requires。
  - 暗色正常；控制台无 JS 报错。
- README 状态行改 `> 状态：M3 归因溯源可用（M4 打磨未开始）。`
- commit `docs: M3 验收收尾`。

## 后续计划（不在本计划内）

- M4 打磨：搜索过滤、大文件折叠、空错态统一、i18n 词典接线（zh/en）。
