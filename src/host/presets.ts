/**
 * 预设清单：一行一个 agent 预设，回答「有几个、从哪来、谁写的、里面装了什么」。
 *
 * 预设是什么：一个目录，里面一份 `agent.cordis.yml`（agent 面的插件组合）
 * 加一份可选的 `preset.yml`（显示用的名字和说明）。目录名就是预设 id。
 * 会话开起来的时候挑一个预设，它决定这个会话能用哪些工具、看到哪些提示词。
 *
 * 三件事各有各的来源，不能混：
 *
 *   **有几个、从哪来** —— 走 `agentPresets` 服务的只读面 `list()`。它每次调用都
 *   重扫磁盘（上游明说不做记忆），所以面板看到的永远是此刻的实况：刚写的预设立刻
 *   出现，刚删的立刻消失。
 *
 *   **内置 / 三方 / 本地** —— 上游只记 `trust: system | user`（发行带的 / 本地写的），
 *   分不出「三方插件带进来的那一批」。而那恰恰是最该问清楚的一档：一个预设决定
 *   模型手里有哪些工具，「这份组合是谁塞进来的」和「它是不是官方发的」不是同一个问题。
 *   所以这里再判一次，判据是**它所在 root 目录的磁盘位置**，和其他各轴共用
 *   {@link vendorOfPath} 那一条规则：不在 node_modules 里 = 本地，在官方 scope 下 =
 *   官方，其余 = 三方（并连带说出是哪个包）。root 不靠配置猜，从预设自己的路径倒推
 *   两级——这样配置里怎么写的都不影响结论。
 *
 *   **配置是什么** —— 直接读 composition 文件并按 dsh 的 YAML 方言解析
 *   （`!!js` 表达式原样保留成 `{__jsExpr}`，见下面的 JS_EXPR_TAG）。**不求值**：
 *   `disabled: !!js process.platform === 'win32'` 这种行，静态侧只知道「有个表达式」，
 *   不知道真假——`Boolean({__jsExpr})` 恒为 true 是陷阱，host/final.ts 已经栽过一次。
 *
 * 只读边界：全程只 stat 和读这两个文件，不写、不改、不碰任何 mount。
 */
import { readFile, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { PresetEntry, PresetInventory, PresetRootView, PresetRow } from '../shared/types.ts'
import { vendorOfPath } from '../shared/vendor.ts'

/** 上游 `agentPresets` 服务的最小只读面（不跨包 import 值，形状对齐 dsh-agent-presets）。 */
interface AgentPresetsLike {
  readonly defaultId?: string
  readonly config?: { roots?: { path?: unknown; trust?: unknown }[] }
  list(): Promise<readonly {
    id: string
    trust: 'system' | 'user'
    path: string
    name?: string
    description?: string
    order?: number
    broken?: string
  }[]>
}

function isPresets(value: unknown): value is AgentPresetsLike {
  return value != null && typeof (value as Partial<AgentPresetsLike>).list === 'function'
}

/** 显示元数据文件的名字（上游 METADATA_FILE 同值；它没导出，这里按文件名认）。 */
const METADATA_FILE = 'preset.yml'

/**
 * dsh 的 entry-list YAML 方言：`!!js <表达式>` 构造成 `{ __jsExpr: '<表达式>' }`。
 *
 * 和 dsh-app-boot 内部那份是同一个约定（host/final.ts 的 jsExprOf 读的就是它）。
 * 非用不可：预设里 `disabled: !!js process.platform === 'win32'` 是常规写法，
 * 拿默认 schema 去 load 会在这一行直接抛「unknown tag」，整个预设就读不出来了。
 */
const JS_EXPR_TAG = 'tag:yaml.org,2002:js'

/** js-yaml 的最小面。动态 import 进来，缺席就降级，不让整根轴塌掉。 */
interface YamlLike {
  load(content: string, options: { schema: unknown }): unknown
  JSON_SCHEMA: { extend(type: unknown): unknown }
  Type: new (tag: string, options: {
    kind: 'scalar'
    construct(data: string): unknown
    represent?(data: unknown): unknown
  }) => unknown
}

let dialect: { yaml: YamlLike; schema: unknown } | null | undefined

/**
 * 拿到解析 composition 用的 YAML 方言，只备一次。
 *
 * 为什么是动态 import：js-yaml 不是本包的依赖，它是 `@deepseek-ai/dsh-app-boot` 和
 * `@deepseek-ai/dsh-agent-presets` 各自的依赖。也就是说——**能读到预设服务，就一定
 * 装了 js-yaml**。但「一定」是今天的事实不是契约，所以静态 import 会把「上游哪天换了
 * YAML 库」变成「dsh-insight 整个插件加载失败」。动态 + 兜底，最坏也只是这一轴少一列。
 * @returns 方言；js-yaml 不在时返回 null。
 */
async function yamlDialect(): Promise<{ yaml: YamlLike; schema: unknown } | null> {
  if (dialect !== undefined) return dialect
  try {
    const mod = await import('js-yaml') as unknown as { default?: YamlLike } & YamlLike
    const yaml = (mod.default ?? mod)
    const jsExpr = new yaml.Type(JS_EXPR_TAG, {
      kind: 'scalar',
      construct: (data: string) => ({ __jsExpr: data }),
    })
    dialect = { yaml, schema: yaml.JSON_SCHEMA.extend(jsExpr) }
  } catch {
    dialect = null
  }
  return dialect
}

/** `!!js` 表达式节点里的原文。 */
function jsExprOf(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const expr = (value as { __jsExpr?: unknown }).__jsExpr
  return typeof expr === 'string' ? expr : undefined
}

/** group 行声明的私有 realm：`isolate: { planMode: true }` → ['planMode']。 */
function isolateNames(value: unknown): string[] | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const names = Object.keys(value as Record<string, unknown>).sort()
  return names.length > 0 ? names : undefined
}

/** composition 的一行 → PresetEntry；容器行往下递归。 */
function toEntry(raw: unknown): PresetEntry | undefined {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return undefined
  const row = raw as Record<string, unknown>
  const name = typeof row.name === 'string' ? row.name : ''
  const group = row.group === true
  const expr = jsExprOf(row.disabled)
  const entry: PresetEntry = {
    id: typeof row.id === 'string' ? row.id : '',
    name,
    group,
    // 表达式未求值时静态侧不声称禁用——Boolean({__jsExpr}) 恒为 true 正是那个陷阱
    disabled: expr === undefined && row.disabled === true,
  }
  if (expr !== undefined) entry.disabledExpr = expr
  const isolate = isolateNames(row.isolate)
  if (isolate !== undefined) entry.isolate = isolate
  if (group) {
    // 容器行的 config 就是它裹着的子行，不是配置
    const children = Array.isArray(row.config)
      ? row.config.flatMap(child => { const e = toEntry(child); return e === undefined ? [] : [e] })
      : []
    entry.children = children
  } else if (row.config !== undefined) {
    entry.config = row.config
  }
  return entry
}

/** 非容器行的总数 = 这个预设真正装了多少个插件。 */
function countPlugins(rows: readonly PresetEntry[]): number {
  let n = 0
  for (const row of rows) {
    if (row.group) n += countPlugins(row.children ?? [])
    else n += 1
  }
  return n
}

/** 读一份 composition。读不出来就把原因带回去，不抛——一个坏预设不该拖垮整张清单。 */
export async function readComposition(path: string): Promise<{ rows?: PresetEntry[]; rowsError?: string }> {
  const d = await yamlDialect()
  if (d === null) return { rowsError: 'js-yaml 不可用，读不出 composition（文件本身没问题，可以点开看原文）' }
  let content: string
  try {
    content = await readFile(path, 'utf8')
  } catch (error) {
    return { rowsError: error instanceof Error ? error.message : String(error) }
  }
  let parsed: unknown
  try {
    parsed = d.yaml.load(content, { schema: d.schema })
  } catch (error) {
    return { rowsError: error instanceof Error ? error.message : String(error) }
  }
  if (!Array.isArray(parsed)) return { rowsError: 'composition 的顶层必须是一个列表' }
  return { rows: parsed.flatMap(row => { const e = toEntry(row); return e === undefined ? [] : [e] }) }
}

/**
 * 每个预设现在有几个活着的会话在用。
 *
 * 判据照抄上游 `resolveSessionPreset` 的语义：创建时选的记在 header 里，之后每换一次
 * 记一条 `agent-preset/selected` 事件，**最后一条赢**。只读 header 会把「中途换过预设的
 * 会话」算回它创建时那个——那正是上游专门写一个解析函数、而不是直接读 header 的原因。
 *
 * 不 import 上游那个函数，是因为它所在的包不是本包的依赖；这里按同样的规则读同样的
 * 两个公开字段（`session.header` 与 `session.events`），规则变了会在测试里现形。
 * @returns 按预设 id 的会话数；agents 服务缺席时是 undefined ——「不知道」不能说成「没人用」。
 */
function sessionPresets(ctx: Context): Map<string, number> | undefined {
  const agents = ctx.get('agents') as { list(): readonly AgentLike[] } | undefined
  if (agents === undefined) return undefined
  try {
    const counts = new Map<string, number>()
    for (const agent of agents.list()) {
      const id = presetOfSession(agent.session)
      if (id === undefined) continue
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return counts
  } catch {
    return undefined
  }
}

/** agent 上我们要读的那两样东西。 */
interface AgentLike {
  session?: {
    header?: { agentPreset?: unknown }
    events?: readonly { type?: unknown; data?: unknown }[]
  }
}

/** 一个会话此刻跑在哪个预设上。 */
function presetOfSession(session: AgentLike['session']): string | undefined {
  if (session === undefined) return undefined
  const events = session.events ?? []
  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (events[i]?.type !== 'agent-preset/selected') continue
    const id = (events[i]?.data as { agentPreset?: unknown } | undefined)?.agentPreset
    return typeof id === 'string' ? id : undefined
  }
  const header = session.header?.agentPreset
  return typeof header === 'string' ? header : undefined
}

/** 文件的大小与改动时间；文件不在就没有。 */
async function fileFacts(path: string): Promise<{ bytes?: number; mtimeMs?: number }> {
  try {
    const s = await stat(path)
    return s.isFile() ? { bytes: s.size, mtimeMs: s.mtimeMs } : {}
  } catch {
    return {}
  }
}

/** preset.yml 在不在。 */
async function hasFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/**
 * 采集预设清单。
 * @param ctx - 本进程的 cordis 上下文。
 * @returns 清单；agentPresets 服务缺席时是空清单，不是错误——那只说明这个 profile
 *   没组预设，跟「出问题了」不是一回事。
 */
export async function collectPresets(ctx: Context): Promise<PresetInventory> {
  const service = ctx.get('agentPresets') as unknown
  if (!isPresets(service)) return { presets: [], roots: [], sessionsKnown: false, service: 'missing' }

  let list: Awaited<ReturnType<AgentPresetsLike['list']>>
  try {
    list = await service.list()
  } catch {
    return { presets: [], roots: [], sessionsKnown: false, service: 'ok' }
  }

  let defaultId: string | undefined
  try {
    const id = service.defaultId
    if (typeof id === 'string' && id !== '') defaultId = id
  } catch {
    defaultId = undefined // 默认值读不到不影响清单本身
  }

  const usage = sessionPresets(ctx)

  const presets: PresetRow[] = await Promise.all(list.map(async (p): Promise<PresetRow> => {
    const dir = dirname(p.path)
    // root 从预设自己的路径倒推，不从配置猜：配置里怎么写的都不改变它实际在哪
    const root = dirname(dir)
    const { vendor, pkg } = vendorOfPath(root)
    const metaPath = join(dir, METADATA_FILE)
    const [facts, meta, composition] = await Promise.all([
      fileFacts(p.path),
      hasFile(metaPath),
      readComposition(p.path),
    ])
    const row: PresetRow = {
      id: p.id,
      trust: p.trust,
      vendor,
      dir,
      path: p.path,
      root,
      isDefault: p.id === defaultId,
      ...(pkg === undefined ? {} : { pkg }),
      ...(p.name === undefined ? {} : { name: p.name }),
      ...(p.description === undefined ? {} : { description: p.description }),
      ...(p.order === undefined ? {} : { order: p.order }),
      ...(p.broken === undefined ? {} : { broken: p.broken }),
      ...(meta ? { metaPath } : {}),
      ...(usage === undefined ? {} : { sessions: usage.get(p.id) ?? 0 }),
      ...facts,
      ...composition,
    }
    if (composition.rows !== undefined) row.plugins = countPlugins(composition.rows)
    return row
  }))

  // root 清单：先按预设实际落在哪归并，再补上配置里声明过、却一个预设都没供出来的那些
  const byRoot = new Map<string, PresetRootView>()
  for (const p of presets) {
    const seen = byRoot.get(p.root)
    if (seen === undefined) {
      byRoot.set(p.root, {
        path: p.root, trust: p.trust, vendor: p.vendor, count: 1,
        ...(p.pkg === undefined ? {} : { pkg: p.pkg }),
      })
    } else seen.count += 1
  }
  for (const declared of service.config?.roots ?? []) {
    // 配置里写的目录可能带尾部斜杠，而从预设路径倒推出来的那份不带——不削平的话
    // 同一个目录会变成两行，其中一行永远 count=0，看起来像「有个 root 是空的」
    const path = trimSep(typeof declared.path === 'string' ? declared.path : '')
    // `~` 开头的配置值上游会展开，这里认不出来就跳过，不去猜用户的家目录
    if (path === '' || path.startsWith('~') || byRoot.has(path)) continue
    const { vendor, pkg } = vendorOfPath(path)
    byRoot.set(path, {
      path,
      trust: declared.trust === 'user' ? 'user' : 'system',
      vendor,
      count: 0,
      ...(pkg === undefined ? {} : { pkg }),
    })
  }

  return {
    // 上游 list() 已经是「靠前的 root 赢」的顺序；这里按它自己声明的 order 排，
    // 没声明的排在后面再按 id——和挑选器看到的顺序一致，不另立一套
    presets: presets.sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER
      const bo = b.order ?? Number.MAX_SAFE_INTEGER
      return ao !== bo ? ao - bo : a.id.localeCompare(b.id)
    }),
    roots: [...byRoot.values()],
    ...(defaultId === undefined ? {} : { defaultId }),
    sessionsKnown: usage !== undefined,
    service: 'ok',
  }
}

/**
 * 预设涉及的路径，**只列不读**：给预览与「在编辑器中打开」的白名单用。
 *
 * 单独一条轻量路径，是因为白名单是每次点击都要建的，而 {@link collectPresets}
 * 会把每份 composition 都解析一遍（几百行 YAML × 预设个数）。为了判一句
 * 「这个路径能不能读」去做那件事，纯属浪费。
 * @param ctx - 本进程的 cordis 上下文。
 * @returns files = 可预览的两个文本文件；dirs = 可以在编辑器里打开的预设目录。
 */
export async function presetPaths(ctx: Context): Promise<{ files: string[]; dirs: string[] }> {
  const service = ctx.get('agentPresets') as unknown
  if (!isPresets(service)) return { files: [], dirs: [] }
  try {
    const list = await service.list()
    const files: string[] = []
    const dirs = new Set<string>()
    for (const p of list) {
      const dir = dirname(p.path)
      dirs.add(dir)
      // 扫出它的那个 root 也算：详情里把它当路径显示，就得让「在编辑器打开」按得动
      dirs.add(dirname(dir))
      files.push(p.path, join(dir, METADATA_FILE))
    }
    return { files, dirs: [...dirs] }
  } catch {
    return { files: [], dirs: [] } // 列不出来就一个都不放行
  }
}

/** 削掉尾部的路径分隔符（根目录 `/` 除外，那一整个就是它自己）。 */
function trimSep(path: string): string {
  const trimmed = path.replace(/[\\/]+$/u, '')
  return trimmed === '' ? path : trimmed
}

/** 目录名（列表里显示 root 时用短名比全路径可读）。 */
export function rootLabel(path: string): string {
  return basename(path) || path
}
