/** dsh-insight host/client 共享 wire 类型。两端各自编译，值不跨端，类型从这里对齐。 */
import type { Vendor } from './vendor.ts'

/** 包私有 RPC 通道名（host: connection.rpc.handle；client: connection.rpc.call）。 */
export const INSIGHT_CHANNEL = '/dsh-insight'

export type InsightEndpoint =
  | 'files/list'
  | 'files/open'
  | 'files/read'
  | 'config/layers'
  | 'config/final'
  | 'plugins/tree'
  | 'plugins/graph'
  | 'settings/list'
  | 'plugins/tools'
  | 'models/list'
  | 'insight/summary'
  | 'host/status'
  | 'host/restart'
  | 'presets/list'
  | 'config/toggle'

/**
 * RPC 结果信封：与 dsh-host-apiproxy 的 RpcResult 形状一致（不跨端 import，本地镜像）。
 *
 * `details` 不是可选的装饰——传输层的 zod schema 对每个 code 都**要求**它存在
 * （bad-request 要 `{ issues: [] }`，internal 要 `{}`）。少写这一段，浏览器那边
 * 连信封都解不出来：拿到的不是我们写的 message，而是一坨 zod 校验残骸。
 */
export type InsightResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'bad-request'; message: string; details: { issues: unknown[] } } }
  | { ok: false; error: { code: 'internal'; message: string; details: Record<string, never> } }

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
  /** 是否允许通过 Insight RPC 读取正文；credentials 永远为 false。 */
  previewable: boolean
}

/** 层的一条命中：entry id + 本层对它的动作（覆盖语义的第一手表达）。 */
export interface LayerHit {
  id: string
  kind: AttributionEvent['kind']
}

/** 分层合并视图的一层（纯 patch 层；root/settings/credentials 等普通配置文件走 files/list）。 */
export interface LayerView {
  /** 非 patch 文件行为 'file'。 */
  kind: LayerKind
  label: string
  /** 层的磁盘文件；客户端点路径弹预览（内容不再随列表传输）。 */
  patchPath?: string
  /** 本层命中（插入/覆盖/禁用/启用）的 entry。 */
  hits: LayerHit[]
  /** node_modules 内 = 只读（包管理器所有，勿手改）。 */
  readonly: boolean
}

/** 一条溯源事件：entry 在某层被插入/修改/禁用/启用。 */
export interface AttributionEvent {
  /** 层 label（bundle 包名 / 'profile' / '$DSH_HOME'）。 */
  layer: string
  kind: 'insert' | 'update' | 'disable' | 'enable'
}

/** 终态配置树的一条 entry。config 里的 `!!js` 表达式以 `{__jsExpr}` 原样保留。 */
export interface FinalEntry {
  id: string
  name: string
  /**
   * 静态 disabled。`disabled` 写成 `!!js` 表达式时这里恒为 false，真值由 disabledExpr
   * 交给运行时求值——重放不求值，所以静态侧不能声称它被禁用。
   */
  disabled: boolean
  /** disabled 由 `!!js` 表达式决定时的表达式原文；存在即表示静态侧无法判定。 */
  disabledExpr?: string
  config: unknown
  /** 跨层溯源事件流（按层应用顺序）。 */
  events?: AttributionEvent[]
}

export interface DriftReport {
  /** 重放存在、运行时缺失。 */
  missingInRuntime: string[]
  /** 运行时存在、重放缺失；可能是动态注册。 */
  extraInRuntime: string[]
  /** 静态 boolean disabled 与运行时有效状态不同。表达式 disabled 与撞名短 id 不入列。 */
  disabledMismatch: string[]
  /**
   * 短 id 在运行时或重放里出现多次（不同 realm 的同名 entry，如宿主面与 agent 预设
   * 各有一个 tool-bash），归一化后无法确定谁对谁——不参与 disabled 对账，单列于此。
   */
  ambiguous: string[]
  /** disabled 是 `!!js` 表达式、静态侧无法判定的 entry；同样不参与 disabled 对账。 */
  unevaluated: string[]
}

export interface FinalConfig {
  entries: FinalEntry[]
  /** 任一可观察差异存在时为 true；保留给简单 UI 使用。 */
  drift: boolean
  driftReport: DriftReport
}

export type PluginNodeState = 'active' | 'disabled' | 'pending' | 'loading' | 'failed' | 'disposed' | 'unknown'

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
  /** 上游出现未识别 FiberState 时保留原始数值。 */
  rawState?: number
  /** state === 'failed' 时填。 */
  error?: { message: string; stack?: string }
  /** 来源层 label（重放命中的第一层）；运行时动态注册的没有。 */
  origin?: string
  /** 包磁盘目录（解析得到的话）。 */
  path?: string
  /** 该插件 provide 的服务名（active fiber 的 store 键，排序）。 */
  provides?: string[]
  /** 该插件 require 的服务名（fiber.inject 键，排序）。 */
  requires?: string[]
  children: PluginNode[]
}

/** 插件图：我提供的一项服务 + 它的全部消费者（插件完整 id 列表）。 */
export interface ProvidedService {
  service: string
  consumers: string[]
}

/** 插件图：我依赖的一项服务 + 候选提供者；唯一候选才是确定关系。 */
export interface RequiredService {
  service: string
  providers: string[]
  /**
   * providers 为空、但运行时能取到该服务 = cordis / 宿主内置（loader、web、
   * storageDomain、cmdlineArgs 等），本来就没有插件提供它，不是缺失。
   */
  builtin?: boolean
}

/** 插件图节点（plugins/graph 端点）：加载树拍平 + 依赖关系解析到具体插件。 */
export interface PluginGraphNode {
  /** 完整嵌套 id。 */
  id: string
  shortId: string
  /** 模块说明符。 */
  name: string
  state: PluginNodeState
  /** 我提供的服务（含无人消费的服务，consumers 为空）。 */
  provides: ProvidedService[]
  /** 我依赖的服务。 */
  requires: RequiredService[]
}


/** Settings 实况的一个命名空间（settings/list 端点；schema/revision 不透传——只读展示用不到）。 */
export interface SettingsView {
  ns: string
  /** 生效值（secret 位已被 host 剥离）。 */
  value: unknown
  /** 组合 base 层（声明了才有）。 */
  base?: unknown
  /** 用户原文层（存在即用户覆盖）。 */
  user?: unknown
  /** 生效时机：live / restart。 */
  applies: string
  /** schema 声明的 secret 位（点拼路径；set=false 是空槽位）。 */
  secrets: { path: string; set: boolean }[]
}

/** 设置页 556px 摘要（insight/summary 端点）：打开设置第一眼就能判断系统健不健康。 */
export interface InsightSummary {
  plugins: number
  active: number
  disabled: number
  /** 需要人处理的：加载失败 / 卡在等待 / 依赖无人提供（内置不算）。 */
  attention: number
  /** 前几个需要注意的短 id，摘要卡直接点名。 */
  attentionIds: string[]
  userOverrides: number
  userOverrideIds: string[]
  /** 配置层里找不到来源 = 运行时动态注册。 */
  runtimeOnly: number
  services: number
  layers: number
  /** 最后一层（优先级最高）的 label 与可写性。 */
  lastLayer: string
  lastLayerWritable: boolean
}

/**
 * 一个被观察到的工具。
 * source 必须透传到界面上——运行时观察到的是确凿事实，源码扫描出来的是推测，
 * 两者不能混为一谈（扫描依赖构建产物形状，会静默漏掉）。
 */
export interface ObservedTool {
  /** 工具名，就是 LLM 看到的那个（bash / read / web_search…）。 */
  name: string
  /** runtime = 注册发生时旁听到的；scan = 从插件构建产物里抠出来的字面量。 */
  source: 'runtime' | 'scan'
  /** 注册它的包名；运行时靠调用栈反查，扫描时就是被扫的那个包。 */
  pkg?: string
  description?: string
}

/** plugins/tools 端点：工具清单 + 它归属到哪个插件 entry。 */
export interface ToolInventory {
  tools: (ObservedTool & {
    /** 归属到的插件短 id（按包名匹配）；匹配不上时没有。 */
    plugin?: string
    /** 注册它的插件是否在跑——同短 id 有多份时任一份在跑即为 true。 */
    enabled?: boolean
  })[]
  /** 本次进程是否观察到过真实注册（false = 还没有 agent 跑过，列表全是扫描推测）。 */
  observed: boolean
}

/** 一个可选的模型。 */
export interface InventoryModel {
  /** 它属于哪条 provider 路由。 */
  provider: string
  /** 模型 id，就是配置里写的那个（k3-256k / deepseek-v4-flash…）。 */
  id: string
  name: string
  description?: string
  /** 能吃哪些输入（text / image…）。 */
  inputModalities?: string[]
}

/** 一条 provider 路由。 */
export interface ProviderRoute {
  id: string
  name: string
  /** 有 adapter 接上 = 真能用；false = 目录里声明了可配，但还没配。 */
  wired: boolean
  /** 声明它的插件的 settings 命名空间，同时也是那个插件的短 id。 */
  settingsNs?: string
  /** 配置落在该命名空间里的哪个路径，如 providers.kimi-coding。 */
  settingsPath?: string[]
  displayName?: string
  /**
   * 这条路由靠什么激活：
   *   env     配置里写了 apiKeyEnv，key 从环境变量取
   *   api-key 凭据库里存着一份 API key
   *   oauth   凭据库里存着一份 OAuth 授权（grant）
   *   none    两边都没有
   * 三者都只读「有没有、是哪种」，从不读凭据的值。
   */
  auth?: 'env' | 'api-key' | 'oauth' | 'none'
  /** apiKeyEnv 里写的环境变量**名字**（不是值）。 */
  authEnv?: string
}

/** models/list 端点：模型清单 + provider 接线情况 + 当前默认选择。 */
export interface ModelInventory {
  models: InventoryModel[]
  providers: ProviderRoute[]
  /** agent 现在实际在用的那个。 */
  default?: { provider: string; model: string; reasoningEffort?: string }
}

/**
 * host/status 端点：这个 dsh 进程的身份、自助重启能不能用、现在忙不忙。
 * 面板每隔几秒问一次——「立即重启」按钮要不要置灰全看这一份。
 */
export interface HostStatus {
  /** 本次进程的启动标识。重启后必然换一个，客户端靠它认出「已经是新进程了」。 */
  boot: string
  /** 自助重启可不可用。被进程守护接管、或被环境变量关掉时为 false。 */
  canRestart: boolean
  /** 认出来的进程守护名（目前只认 systemd）。有值就说明重启该归它管。 */
  supervisor?: string
  /** 正在执行的会话数。> 0 时按钮置灰——重启会把它们打断。 */
  running: number
}

/** host/restart 端点的回执。不抛错，把「为什么不能重启」原样带回给界面。 */
export type RestartAck =
  | {
    ok: true
    /** 重启前这个进程的 boot；客户端拿它跟轮询到的新值比对。 */
    boot: string
    pid: number
    helperPid?: number
    /** 接力进程的日志落点，起不来时去这里看。 */
    logOut: string
    logErr: string
  }
  | {
    ok: false
    /** off = 这台机器不允许；busy = 有会话在跑；scheduled = 已经在重启了；failed = 拉接力进程时就炸了。 */
    reason: 'off' | 'busy' | 'scheduled' | 'failed'
    message: string
    /** reason === 'off' 且是被进程守护接管时带上它的名字。 */
    supervisor?: string
    /** reason === 'busy' 时正在跑的会话数。 */
    running?: number
  }

// ───────────────────────────── 按预设 ─────────────────────────────

/**
 * 预设 composition 里的一行。形状刻意对齐 {@link FinalEntry}——
 * 预设本来就是一份 cordis 配置，只不过挂在 agent 这一面而不是宿主面。
 */
export interface PresetEntry {
  /** 行 id（composition 里写的那个）。 */
  id: string
  /** 模块说明符；容器行是 `cordis:group`。 */
  name: string
  /** 容器行：children 是它裹着的那些行。 */
  group: boolean
  /**
   * 静态 disabled。写成 `!!js` 表达式时这里恒为 false，真值由 disabledExpr
   * 交给运行时求值——静态侧不求值，所以不能声称它被禁用。
   */
  disabled: boolean
  /** disabled 是 `!!js` 表达式时的原文；存在即表示静态侧判不了。 */
  disabledExpr?: string
  /** 这一行自己的配置。容器行的 config 是子行，不重复放这里。 */
  config?: unknown
  /** 容器行声明的私有 realm：被隔离的服务名。预设里的服务必须待在这种 realm 里。 */
  isolate?: string[]
  children?: PresetEntry[]
}

/** 一个 agent 预设。 */
export interface PresetRow {
  /** 预设 id，就是它的目录名。 */
  id: string
  /** 它给自己起的显示名（preset.yml）；没有就用 id。 */
  name?: string
  /** 一句话说明它是干什么的。 */
  description?: string
  /** 它声明的排序位置；没声明的排在声明了的后面。 */
  order?: number
  /**
   * 上游按「从哪个 root 扫出来的」记的信任级别：
   * system = 随部署一起发的，user = 本地写的（因此和 shell 权限同级）。
   */
  trust: 'system' | 'user'
  /** 出处：官方 / 三方 / 本地。按 root 目录判，与其他各轴同一套规则。 */
  vendor: Vendor
  /** vendor 不是 local 时，是哪个包带进来的。 */
  pkg?: string
  /** 预设自己的目录。 */
  dir: string
  /** composition 文件（agent.cordis.yml）绝对路径。 */
  path: string
  /** 显示元数据文件（preset.yml）；没有这个文件就没有这一项。 */
  metaPath?: string
  /** 扫出它的那个 root 目录。 */
  root: string
  /** 会话没点名预设时挂的就是它。 */
  isDefault: boolean
  /** 现在有几个活着的会话跑在这个预设上（0 = 此刻没人用它）。 */
  sessions?: number
  /** 坏在哪。能用就没有——坏的预设仍然留在名单上，否则它占着 id 却无处可查、无处可删。 */
  broken?: string
  /** composition 里的行。读不出来时缺席，原因见 rowsError。 */
  rows?: PresetEntry[]
  /** 读不出 composition 的原因（文件坏了、或者没有 YAML 解析器）。 */
  rowsError?: string
  /** 非容器行的总数 = 这个预设真正装了多少个插件。 */
  plugins?: number
  /** composition 文件的大小与改动时间，回答「什么时候动过」。 */
  bytes?: number
  mtimeMs?: number
}

/** 一个被扫描的 root 目录。 */
export interface PresetRootView {
  path: string
  trust: 'system' | 'user'
  vendor: Vendor
  pkg?: string
  /** 这个 root 供出了几个预设。0 说明目录在、但一个预设都没有。 */
  count: number
}

/** presets/list 端点：预设清单 + 扫描的 root + 默认是哪个。 */
export interface PresetInventory {
  presets: PresetRow[]
  /** 按优先级排的 root；同 id 时靠前的赢。 */
  roots: PresetRootView[]
  /** 会话没点名时挂的那个 id。 */
  defaultId?: string
  /** 会话实况读到了没有。读不到时各行的 sessions 缺席，界面就不许声称「没人用」。 */
  sessionsKnown: boolean
  /**
   * 预设服务在不在。
   *
   * 空清单有两种截然不同的成因，混成一句「没有预设」是在把问题藏起来：
   * `missing` = 没有插件在提供 agentPresets（没装，或者被你关掉了）——这时候
   * 该去「按插件」找那一条；`ok` = 服务在、扫过了、确实一个预设都没有。
   */
  service: 'ok' | 'missing'
}

/**
 * config/toggle 端点的回执。
 *
 * 这是整个插件唯一会改磁盘的动作，所以「做了什么」要说得比成功与否更细：
 * inserted = 补丁层里本来没有这一条，新写了一段；updated = 改了已有那一段的开关；
 * removed  = 这一行写下去等于没写（跟不写它的效果一样），所以把它删掉而不是留一行废话；
 * unchanged = 目标状态和文件里写的一样，一个字节都没动。
 */
export type ToggleResult =
  | { ok: true; path: string; action: 'inserted' | 'updated' | 'removed' | 'unchanged'; disabled: boolean }
  | {
    ok: false
    /**
     * ambiguous = 短 id 撞名，写下去会同时命中多个；
     * not-found = 运行时根本没有这个插件；
     * refused   = 目标路径或 id 不合法（只写 $DSH_HOME 里的 profile 补丁层）；
     * failed    = 落盘本身失败。
     */
    reason: 'ambiguous' | 'not-found' | 'refused' | 'failed'
    message: string
  }
