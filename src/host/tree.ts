/**
 * 插件树采集：从 ctx.loader 实况逐 entry 投影成 PluginNode，再按嵌套 id 前缀重建层级。
 * 全部字段读取都容错——单个 entry 的异常不能拖垮整棵树。
 */
import { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import type { PluginNode, PluginNodeState } from '../shared/types.ts'

export type { PluginNode } from '../shared/types.ts'

/**
 * Fiber.state 的数字含义（cordis 的 FiberState 是 const enum，import 有 isolatedModules 风险）：
 * 0 PENDING / 1 LOADING / 2 ACTIVE / 3 FAILED / 4 DISPOSED / 5 UNLOADING。
 */
const FIBER_STATE: Record<number, PluginNodeState> = {
  0: 'pending',
  1: 'loading',
  2: 'active',
  3: 'failed',
  4: 'disposed',
  5: 'disposed', // UNLOADING 按已下线展示
}

export interface CollectContext {
  loader: {
    entries(): Iterable<unknown>
  }
  /** cordis Context 的服务解析；用来把「无人提供」区分成内置服务与真缺失。 */
  get?(name: string): unknown
}

export interface CollectOptions {
  /** 短 id → 来源层 label（重放首次命中的层）。 */
  originOf?(shortId: string): string | undefined
  /** 模块说明符 → 包磁盘目录。 */
  resolvePath?(name: string): string | undefined
}

interface EntryLike {
  id: string
  disabled: boolean
  options: { name?: string; group?: boolean | null; inject?: unknown }
  subtree?: unknown
  fiber?: { state: number; _error?: unknown; entry?: unknown; store?: Record<string, { fiber?: { entry?: unknown } | undefined } | undefined>; inject?: Record<string, unknown> }
}

function stateOf(entry: EntryLike): PluginNodeState {
  if (entry.disabled) return 'disabled'
  const fiber = entry.fiber
  if (fiber === undefined) return 'pending' // 未拉起（import 失败等），按待定展示
  return FIBER_STATE[fiber.state] ?? 'unknown'
}

function errorOf(entry: EntryLike, state: PluginNodeState): PluginNode['error'] {
  if (state !== 'failed') return undefined
  const raw: unknown = entry.fiber?._error
  if (raw instanceof Error) {
    const out: PluginNode['error'] = { message: raw.message }
    if (raw.stack !== undefined) out.stack = raw.stack
    return out
  }
  return { message: String(raw) }
}

/** 遍历 loader 实况，投影成拍平的 PluginNode 列表（children 为空，层级由 buildTree 重建）。 */
export function collectNodes(ctx: CollectContext, options: CollectOptions = {}): PluginNode[] {
  const nodes: PluginNode[] = []
  for (const raw of ctx.loader.entries()) {
    const entry = raw as EntryLike
    try {
      const id = entry.id
      const sep = id.lastIndexOf(EntryTree.sep)
      const shortId = sep < 0 ? id : id.slice(sep + 1)
      const name = String(entry.options.name ?? '')
      const node: PluginNode = {
        id,
        shortId,
        name,
        group: Boolean(entry.options.group) || entry.subtree !== undefined,
        disabled: Boolean(entry.disabled),
        state: stateOf(entry),
        children: [],
      }
      const error = errorOf(entry, node.state)
      if (error !== undefined) node.error = error
      if (entry.fiber !== undefined && FIBER_STATE[entry.fiber.state] === undefined) node.rawState = entry.fiber.state
      // 能力：fiber.store 同时混入"注入的依赖"与"provide 的服务"。区分靠 impl 的归属 fiber：
      // 服务常在 entry 的子 fiber（Service 类实例）里 provide，归属判定 = impl.fiber 是自己，
      // 或 impl.fiber.entry 指回本 entry（loader 的 internal/plugin 监听会给子 fiber 挂 entry）。
      const fiber = entry.fiber
      if (fiber?.store !== undefined) {
        const provides = Object.keys(fiber.store).filter(k => {
          const owner = fiber.store?.[k]?.fiber
          return owner === fiber || (owner !== undefined && owner.entry === raw)
        })
        if (provides.length > 0) node.provides = provides.sort()
      }
      const injectSource: unknown = fiber?.inject ?? entry.options.inject
      const injectKeys = Array.isArray(injectSource) ? injectSource.map(String) : Object.keys((injectSource as Record<string, unknown> | null) ?? {})
      if (injectKeys.length > 0) node.requires = injectKeys.sort()
      const origin = options.originOf?.(shortId)
      if (origin !== undefined) node.origin = origin
      if (name !== '') {
        const path = options.resolvePath?.(name)
        if (path !== undefined) node.path = path
      }
      nodes.push(node)
    } catch (error) {
      // 单条读取失败：保留占位节点，不拖垮整棵树
      nodes.push({
        id: '(collect-error)',
        shortId: '(collect-error)',
        name: '',
        group: false,
        disabled: false,
        state: 'failed',
        error: { message: error instanceof Error ? error.message : String(error) },
        children: [],
      })
    }
  }
  return nodes
}

/** 把拍平节点按嵌套 id 前缀重建成森林：父 = id 去掉最后一段，找不到父则挂根。 */
export function buildTree(nodes: PluginNode[]): PluginNode[] {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const roots: PluginNode[] = []
  for (const node of nodes) {
    const sep = node.id.lastIndexOf(EntryTree.sep)
    const parent = sep < 0 ? undefined : byId.get(node.id.slice(0, sep))
    if (parent === undefined) roots.push(node)
    else parent.children.push(node)
  }
  return roots
}

/** 一步到位：采集 + 建树。 */
export function collectTree(ctx: CollectContext, options: CollectOptions = {}): PluginNode[] {
  return buildTree(collectNodes(ctx, options))
}
