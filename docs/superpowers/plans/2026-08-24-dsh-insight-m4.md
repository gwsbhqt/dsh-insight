# dsh-insight M4 实施计划：打磨（i18n / 搜索过滤 / 空错态 / 折叠）

> **For agentic workers:** 按任务序执行；每任务结束跑通测试再进下一个。

**Goal:** 面板文案全部走 zh/en 词典（locale seat 正式通路）；四个数据 tab 支持搜索过滤；加载/空/错三态统一组件；大内容折叠确认到位。

## 探活结论（已验证，不阻塞）

- 正式通路：`ctx.locale.register('dsh-insight', { zh, en })` 注册词典（typed form 强制双语平衡，缺 key 编译报错）；slot `register` 选项加 `locale: 'dsh-insight'`，框架把 typed `t` 注入组件 props，语言切换自动重渲染。
- 词典命名空间用声明合并：`declare module '@deepseek-ai/dsh-client-ui-slots' { interface LocaleNamespaceMap { 'dsh-insight': InsightLocaleKey } }`。
- 文案清点：6 个组件约 35 条（tab 名、按钮、空态、状态徽章、事件 kind、Settings 标签）。
- `ReadBlock` 默认 `DEFAULT_READ_MAX_LINES=16` 中段折叠——分层 YAML 的"大文件折叠"已内建，M4 只需显式确认。

### Task 1: i18n 词典接线

**Files:** Create: `src/client/locale.ts`（zh/en 词典 + key 类型 + declare module 合并）；Modify: `src/client/index.tsx`（register + slot locale 声明）、六个组件（文案改 `t('key')`，t 从 InsightSection 的 props 逐层传）

- key 命名：`tab.files` / `panel.empty.files` / `state.active` / `event.insert` 这类点分层。
- `t` prop 类型用 `Translate`（非 typed seat 也行，但 typed 免费）：`InsightSection({ ctx, t }: { ctx: ClientContext; t: TranslateNS<'dsh-insight'> })`。
- 模板参数走 `{name}` 占位（如 `命中 {count} 条`）。
- 测试：client.spec 扩——fakeCtx 加 locale.register/spy，断言词典双语 key 集合相等（运行时兜底编译期检查）。

### Task 2: 搜索过滤

**Files:** Modify: `InsightSection.tsx`（header 加搜索框 + query state）、`FilesPanel.tsx`、`FinalTreeView.tsx`、`PluginsTreeView.tsx`、`SettingsView.tsx`（各接 `query` prop）

- 搜索框放 tab 栏右侧（刷新左边），placeholder 走词典；切 tab 保留 query。
- 过滤规则（大小写不敏感 substring）：
  - files：path / layer
  - final：id / name
  - plugins：拍平所有节点按 shortId/name 过滤（搜索时不渲染层级，结果平铺——嵌套容器内命中直接列出该节点）
  - settings：ns
- 过滤后为空显示词典化空态（`panel.empty.search`「无匹配」）。

### Task 3: 空错态统一 + 折叠确认

**Files:** Create: `src/client/components/PanelStatus.tsx`；Modify: 五个面板

- `PanelStatus({ kind: 'loading' | 'error' | 'empty', text })` 统一渲染（颜色/字号一致），InsightSection 与各面板的 loading/error/empty 全改用它。
- LayersView 显式 `maxLines={16}`（注释说明即内建折叠语义）；终态 JsonTree 与 Settings 三层 JsonTree 依赖其内部折叠，不再包一层。

### Task 4: check + commit

`pnpm run check` 全绿；commit `feat(client): M4 打磨（i18n 词典/搜索过滤/统一空错态）`。

### Task 5: M4 验收与收尾

- 重启 dev profile，无头 Chrome：
  - 中文界面全量正常（无漏网硬编码）。
  - 设置 → 通用 → Language 切 English → Insight 面板变英文（tab、徽章、空态、事件 kind）。
  - 搜索：插件树搜 "llm" 平铺出匹配项；终态搜 "web" 出 webserver/web-runtime；清空恢复。
  - 分层合并大 YAML（dsh-base 17.7KB）折叠正常。
  - 暗色 + 无 JS 报错。
- README 状态行改 `> 状态：M4 打磨完成。`，计划勾选，commit `docs: M4 验收收尾`。
- 发布评估写进 README 或单独笔记（spec §8："之后视情况启动发布"）。

## 后续（不在本计划内）

- 发布：npm publish 流程、仓库公开、安装文档。
