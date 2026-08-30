# dsh-insight 改进实施计划

> 范围：不处理 Node 版本与依赖升级；优先修复安全边界、诊断可信度、异步状态和回归测试。

## 目标

1. 配置文件 RPC 只能访问 Host 明确认可的路径，凭据文件永不返回正文。
2. 文件预览只读取前 256 KiB，拒绝目录、设备文件和未授权路径。
3. 插件来源遇到短 ID 冲突时不做错误归因；未知 Fiber 状态显式展示。
4. 依赖图保留多提供者信息，不再把遍历顺序误当成真实注入关系。
5. 配置漂移输出结构化差异，同时保持旧的 `drift` 汇总字段。
6. RPC 请求支持取消；Settings 刷新时同步刷新其依赖的 Layers 数据。
7. 增加覆盖上述行为的单元测试，并同步 README 与许可证文件。

## 实施阶段

### 阶段 1：文件访问安全

- 为配置文件元数据增加 `previewable`。
- Host 根据当前 profile 重建允许读取的文件集合。
- `files/read` 仅允许集合内、非 credentials 的普通文件。
- `files/open` 仅允许已发现配置文件和已解析插件目录。
- 使用 `realpath` 后校验，避免符号链接绕过。
- 预览通过文件句柄限量读取，避免整文件进入内存。
- Client 对不可预览文件不展示预览入口。

### 阶段 2：诊断可信度

- 同一短 ID 在 Loader 中出现多次时，不展示推断来源。
- 增加 `unknown` 插件状态并保留原始 Fiber 状态码。
- 依赖图返回所有候选 provider；仅唯一时设置确定 provider。
- 终态对账返回缺失项、运行时额外项和 disabled 差异。
- entry 比较改为稳定规范化比较，避免对象键顺序导致假更新。

### 阶段 3：Client 状态与反馈

- `callInsight` 接收 AbortSignal。
- `useRpc` 在失活、刷新和卸载时取消旧请求。
- Settings 刷新同时刷新 Layers。
- 文件打开和复制失败显示可见反馈。
- UI 展示未知状态、多 provider 和结构化 drift 摘要。

### 阶段 4：测试与文档

- 增加路径 allowlist、credentials 拒绝、限量读取和符号链接测试。
- 增加短 ID 冲突、未知状态、多 provider、结构化 drift 测试。
- 更新 README 的架构、限制和安全说明。
- 补充 MIT LICENSE。
- 运行 typecheck；测试与构建若受既有工具链阻塞，记录准确结果。

## 验收标准

- 任意绝对路径不能绕过 `files/read` / `files/open`。
- `.credentials.yaml` 只能显示存在性和元数据，无法通过 RPC 读取正文。
- 大文件预览最多返回 256 KiB，且 UTF-8 尾部不出现替换字符。
- 多 provider 和来源冲突不会被展示成唯一确定结论。
- drift 至少区分 missing、extra、disabled mismatch。
- 快速切换或刷新不会让旧 RPC 覆盖新结果。
- `pnpm typecheck` 通过；新增测试逻辑通过可用的测试执行通道验证。
