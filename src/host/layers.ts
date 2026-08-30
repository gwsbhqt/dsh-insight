/**
 * 配置分层重建与逐层重放。
 * 重建走 dsh-app-boot 的 loadProfile/loadOptionalPatches——与启动同一代码路径，
 * 语义等价是字面保证。重放用 cordis-plugin-include 的 applyEntryPatches 逐层
 * 推进并 diff 快照，产出每层的命中标注（M3 在此基础上扩成完整溯源事件流）。
 *
 * 已知缺口：--patch 覆盖层与遥测开关只存在于运行时 include config，重建拿不到；
 * 由 loader 对账的 drift 标记兜住。
 */
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadOptionalPatches, loadProfile } from '@deepseek-ai/dsh-app-boot'
import { applyEntryPatches, type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { AttributionEvent, LayerHit, LayerKind, LayerView } from '../shared/types.ts'

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

function stableValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === undefined) return { __type: 'undefined' }
  if (typeof value === 'bigint') return { __type: 'bigint', value: value.toString() }
  if (typeof value === 'function') return { __type: 'function', value: String(value) }
  if (typeof value !== 'object' || value === null) return value
  if (seen.has(value)) return { __type: 'circular' }
  seen.add(value)
  if (Array.isArray(value)) return value.map(item => stableValue(item, seen))
  return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stableValue(item, seen)]))
}

/**
 * 静态 disabled：`!!js` 表达式返回 undefined（重放不求值，静态侧不知道真假）。
 * 与 host/final.ts 的 jsExprOf 是同一条纪律——`Boolean({__jsExpr})` 恒为 true 是陷阱。
 */
function staticDisabled(value: unknown): boolean | undefined {
  if (typeof value === 'object' && value !== null && typeof (value as { __jsExpr?: unknown }).__jsExpr === 'string') return undefined
  return Boolean(value)
}

function entryEqual(a: EntryOptions, b: EntryOptions): boolean {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b))
}

/** 逐层重放：返回终态、每层命中的 entry id、每 entry 的跨层溯源事件流。 */
export function replayLayers(layers: PatchLayer[]): { final: EntryOptions[]; hits: LayerHit[][]; events: Record<string, AttributionEvent[]> } {
  let entries: EntryOptions[] = []
  const hits: LayerHit[][] = []
  const events: Record<string, AttributionEvent[]> = {}
  for (const layer of layers) {
    const before = new Map(entries.map(e => [e.id, e]))
    entries = applyEntryPatches(entries, structuredClone(layer.patches), () => {})
    const touched: LayerHit[] = []
    for (const entry of entries) {
      if (entry.id === undefined) continue
      const prev = before.get(entry.id)
      if (prev !== undefined && entryEqual(prev, entry)) continue
      // 事件分类：新插入 / disabled 翻转 / 其余内容变化
      let kind: AttributionEvent['kind']
      if (prev === undefined) kind = 'insert'
      else {
        const was = staticDisabled(prev.disabled)
        const now = staticDisabled(entry.disabled)
        // 现在是静态值、且与之前不同（表达式态 undefined 也算「不同」——本层把它钉死了），
        // 就是一次开关翻转。不能用 Boolean() 比：Boolean({__jsExpr}) 恒为 true，
        // 会把「表达式 → 显式 true」误判成 update，于是被关掉这件事就丢了。
        kind = now !== undefined && now !== was ? (now ? 'disable' : 'enable') : 'update'
      }
      touched.push({ id: entry.id, kind })
      ;(events[entry.id] ??= []).push({ layer: layer.label, kind })
    }
    hits.push(touched)
  }
  return { final: entries, hits, events }
}

/** node_modules 内的文件归包管理器所有——只读；之外的是用户自己的——可写。 */
function isReadonlyPath(path: string): boolean {
  return /[\/]node_modules[\/]/.test(path)
}

/** 与重放命中拼成视图数据（内容不再随列表传输——客户端用 patchPath 走 files/read 预览）。 */
export function layerViews(layers: PatchLayer[]): LayerView[] {
  const { hits } = replayLayers(layers)
  return layers.map((layer, i) => {
    const view: LayerView = {
      kind: layer.kind, label: layer.label, hits: hits[i] ?? [],
      readonly: layer.patchPath !== undefined && isReadonlyPath(layer.patchPath),
    }
    if (layer.patchPath !== undefined) view.patchPath = layer.patchPath
    return view
  })
}
