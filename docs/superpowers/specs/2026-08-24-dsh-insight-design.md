# dsh-insight 设计文档

> 状态：已与作者逐节确认（构建/样式/落位/通道/发布形态），技术探活完成，无阻塞项。
> 上游草案：README.md v1。本文档取代其中"关键设计决策（待验证）"一节——四条全部有定论。

## 1. 定位与范围

dsh-insight 是 DeepSeek Harness（DSH）的一个插件包（bundle），把运行中 profile 的**分层配置**与**运行时插件树**收拢成 Web 设置面板里的一个只读洞察页。功能范围、非目标以 README 为准，本文不重复；只钉实现层决策。

## 2. 已拍板的决策

| 决策点 | 结论 | 依据 |
|---|---|---|
| 构建 | tsdown 双产物（host ESM + client closure-factory CJS） | dsh-context / codex-subscription 先例；usage-stats 零构建手写 96KB client 是反面教材 |
| 样式 | Tailwind 4 构建期编译，`@theme inline` 映射 `--dsw-alias-*`，不引 preflight | self-evolution `ui-plugins/ipython-ui` 已跑通的完整方案，直接抄 |
| 设置落位 | `settings.section` 顶级 section（id `insight`） | codex-subscription 已验证；`settings.plugins.tab` 无先例，留作后续迁移选项 |
| 数据通道 | `ctx.connection.rpc.handle('/dsh-insight', handler, {authority:'loopback'})` | codex-subscription 先例；免去 usage-stats 裸 HTTP 的自建 loopback fence |
| 发布形态 | 先本地（`dsh plugin add <目录>` / `--patch`），稳定后再发 npm/dshmarket | 强依赖 dsh-app-boot 内部组合语义，兼容矩阵成本后置 |

## 3. 探活结论（README 待验证四项）

1. **分层合成**：运行时 root include entry 的 `config.patches` 持有完整 patch 栈但丢失层归属。host 半改为直接复用已发布 npm 的 `@deepseek-ai/dsh-app-boot`（`loadProfile`/`composeEntries`/`loadOptionalPatches`）与 `@deepseek-ai/cordis-plugin-include`（`applyEntryPatches`）——与启动同一实现，语义等价是字面保证。
2. **禁用归因**：运行时拿不到"被哪层禁用"，由 host 半逐层重放 `applyEntryPatches` 并 diff 快照补齐。
3. **插件树实况**：`ctx.loader` 的 `Entry` 暴露层级 id、有效 disabled（含父级传递）、options、`fiber`（FiberState: PENDING/LOADING/ACTIVE/FAILED/UNLOADING/DISPOSED + error）、`subgroup/subtree`（group/isolate 层级）。
4. **settings 实况**：`ctx.settings.describe({redactSecrets:true})` 逐命名空间返回 schema、生效值、base 层、user 原始层、revision、secrets 位置——差异标注与脱敏都是现成能力。

## 4. 包结构

```
dsh-insight/
├── package.json          # dsh.bundle.patch + dsh.client{platform:web, inject:[...]}
├── cordis.patch.yml      # - insert: [{id: dsh-insight, name: dsh-insight}]
├── tsdown.config.ts      # host ESM + client closure-factory CJS + tailwind 虚拟模块插件
├── src/
│   ├── host/
│   │   ├── index.ts      # cordis 插件入口（name/inject/apply），装 RPC handler
│   │   ├── layers.ts     # 分层重建 + 逐层重放归因
│   │   ├── tree.ts       # loader EntryTree 实况采集
│   │   ├── settings.ts   # settings.describe 实况采集（redactSecrets）
│   │   └── files.ts      # 配置文件清单（credentials 键名-only）
│   ├── client/
│   │   ├── index.ts      # installStyles → locale → settings.section 注册
│   │   ├── tailwind.css  # @theme inline + dsw token 映射（抄 ipython-ui）
│   │   ├── styles.ts     # 幂等 <style data-plugin> 注入
│   │   └── components/   # 各面板组件
│   └── shared/types.ts   # RPC wire 类型（host/client 共享）
└── tests/                # vitest
```

## 5. Host 半数据面

`inject: ['loader', 'settings', 'connection']`。`apply` 只注册 RPC handler；所有数据在 RPC 调用时实时采集（无缓存、无 watch，重开面板即最新）。

| 端点 | 数据 | 来源 |
|---|---|---|
| `files/list` | 配置文件清单：路径、大小、mtime、所属层 | 文件系统 + `loadProfile` 层归属 |
| `config/layers` | 每层原始 YAML + 该层命中的 entry id 列表 | 读文件 + 重放 diff |
| `config/final` | 终态 entry 树；溯源事件流字段 M1 恒为空、M3 才填 | 重放 + loader 对账 |
| `plugins/tree` | id、包名、disabled、fiber 状态、error、group 层级 | `ctx.loader` 实况 |
| `settings/list` | 各命名空间生效值/base/user/secrets | `ctx.settings.describe({redactSecrets:true})` |

**归因重放算法**（layers.ts 核心）：

1. `loadProfile` + 各 `load*Patches` 重建分层（与启动同一代码路径）。
2. 从空 entry list 逐层 `applyEntryPatches`，每层后快照 entry map 做 diff → 每条 entry 累积溯源事件（`第 N 层插入` / `第 M 层覆盖 config` / `第 K 层 disabled`）。
3. 对账：重放终态 vs loader 实况（id 集合 + disabled 状态）。不一致（如运行时 HMR 变更）则终态以 loader 为准，溯源标注"重放失真，归因仅供参考"。
4. `!!js` 表达式重放时不求值，原样展示。

**凭据**：`.credentials.yaml` 与 env 只出现在文件清单与"被哪些键引用"的引用名列表，值永不读、永不传。

**实现期探活点**（不阻塞设计）：profile 名在插件进程里的获取途径（环境变量/启动参数）；`credentials` 服务是否有键名枚举 API（没有则解析 YAML 只取键）。

## 6. Client 半

`apply(ctx)`：`installStyles()` → `locale.register('dsh-insight', {zh, en})` → 注册 `settings.section`。

`dsh.client.inject`：`@deepseek-ai/dsh-client-connection`、`dsh-client-locale`、`dsh-client-runtime`、`dsh-client-ui-primitives`、`dsh-client-ui-settings`。

页面：一个 section 页，页内子 tab 与端点一一对应——`[配置文件] [分层合并] [终态配置] [插件树] [Settings]` + 手动刷新 ⟳。

- **配置文件**：表格：路径、层徽章（bundle/profile/home/--patch）、大小、mtime；credentials 行只显示键名数量。
- **分层合并**：按合并顺序的层手风琴，只读 YAML（高亮方案实现期定：先试 ui-primitives 的 code 组件，不够就写极简 YAML tokenizer），命中条目行内标注。
- **终态配置**：复用 ui-primitives `JsonTree`；entry 点开右侧**溯源抽屉**，展示跨层事件流。
- **插件树**：懒展开树。每行 = id、包名、状态徽章（active=ok / disabled=dimmed / pending=warn / failed=err），失败行可展开 message/stack，小字标注来源 bundle 与磁盘路径。
- **Settings**：命名空间列表，生效值/base/user 三层对照，user 覆盖键高亮，secret 位显示 `***`。

横切约定：

- 数据流：tab 首次激活拉一次 + 手动刷新；无订阅无轮询；各面板自带加载/空/错三态。
- 能力清单（M3）：host 采 service/event/tool 注册；client 自读浏览器侧 loader entry 树采 slot 占用，拼进插件树详情。
- HMR 安全：slot 注册全走 `ctx.slots.inject` effect；style 标签幂等。
- i18n：zh/en 词典第一天就建，文案不硬编码。

## 7. 测试（vitest，配置抄 dsh-context）

- **重放语义对账**（最关键）：fixture 分层逐层重放结果 == `composeEntries` 直接合成结果；归因标注与手工预期一致。
- **tree.ts 采集**：测试里用已发布的 `@deepseek-ai/cordis` + loader 真起小树，断言采集输出（含 FAILED/PENDING）。
- **client 组件**：jsdom 车道，渲染 + dispose 摘除断言（HMR 安全）。
- **契约守卫**（抄 ipython-ui spec）：平台模块白名单不漂、Tailwind 产物无 `--color-*:` 间接层、只引用真实 dsw token。
- RPC handler 的 ok/error 信封形状（参考 codex 的 publicError 模式）。

## 8. 里程碑

- **M0 骨架端到端**：包结构 + 构建 + 空 Insight section 页出现在设置里。先打通"装上就能跑"。
- **M1 配置洞察**：`files/list` + `config/layers` + `config/final`（无溯源）+ 前三个 tab。
- **M2 插件树**：`plugins/tree` + 插件树 tab（状态徽章 + 失败原因 + 来源）。
- **M3 归因溯源**：溯源 drawer、Settings 实况 tab、能力清单。
- **M4 打磨**：搜索过滤、大文件折叠、空错态、i18n 补全；之后视情况启动发布。

每个里程碑在真实 `dsh web` profile 里手测验收（`pnpm link` / `--patch` 装入）。

## 9. 参考先例速查

| 主题 | 参照 |
|---|---|
| 包形态 / cordis.patch.yml / dsh.client | 三家一致（usage-stats / codex / dsh-context） |
| tsdown + Tailwind 4 集成 | self-evolution `ui-plugins/ipython-ui`（含 `@theme inline` 生死线、虚拟模块名不许 `.css` 结尾） |
| 包私有 RPC | codex-subscription `ctx.connection.rpc.handle` |
| 官方插件机制逐行核实 | dsh-context `docs/research/dsh-monorepo-and-plugin-practices.md` |
| settings.section 注册 | codex-subscription client.jsx |
| 重放/分层 API | `@deepseek-ai/dsh-app-boot`、`@deepseek-ai/cordis-plugin-include`（均已发布 npm） |
