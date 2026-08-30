/**
 * 终态配置树：重放结果 + loader 实况对账。
 * 终态内容以重放为准（带 config 全文）；结构化 drift 报告列出缺失、额外和静态 disabled 差异，
 * 让界面在 --patch 覆盖层、运行时动态增删或状态翻转时明确提示归因仅供参考。
 *
 * 对账只在「能确定比对对象」时才下结论，两条已知的不可比情形单列而不伪造 drift：
 * - 撞名：短 id 在运行时或重放里出现多次（宿主面与 agent 预设各有一个 tool-bash，
 *   归一化成同一个短 id 后无从判断该跟哪一个比）。与 originResolver / buildDossiers
 *   的「短 id 唯一才归因」是同一条纪律。
 * - 未求值：disabled 写成 `!!js` 表达式，重放按约定原样保留（`{__jsExpr}`），
 *   静态侧根本不知道它是真是假，拿它跟运行时比必然假阳性。
 */
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { AttributionEvent, FinalConfig, FinalEntry } from '../shared/types.ts'

/** loader 实况的最小投影（测试可直接构造）。 */
export interface LiveEntryState {
  id: string
  disabled: boolean
}

/** `!!js` 表达式节点：dsh-app-boot 的 YAML dialect 把 `!!js foo` 构造成 `{ __jsExpr: 'foo' }`。 */
function jsExprOf(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const expr = (value as { __jsExpr?: unknown }).__jsExpr
  return typeof expr === 'string' ? expr : undefined
}

function countById(ids: Iterable<string>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  return counts
}

/**
 * 组装终态视图。
 * drift 对账可观察的 entry 集合与静态 boolean disabled；config 不比对，因为 Loader 不暴露同形终态配置。
 * extra 项可能来自运行时动态注册；撞名与表达式 disabled 不参与比对，单列在 ambiguous / unevaluated。
 * @param replayed - replayLayers 的终态。
 * @param live - ctx.loader.entries() 的 (id, disabled) 投影（id 已按 EntryTree.sep 归一化，可能撞名）。
 */
export function toFinalConfig(replayed: EntryOptions[], live: LiveEntryState[], events: Record<string, AttributionEvent[]> = {}): FinalConfig {
  const entries: FinalEntry[] = replayed.map(e => {
    const expr = jsExprOf(e.disabled)
    const entry: FinalEntry = {
      id: e.id ?? '',
      name: String(e.name ?? ''),
      // 表达式未求值时静态侧不声称禁用——Boolean({__jsExpr}) 恒为 true 正是旧实现的假阳性来源
      disabled: expr === undefined && Boolean(e.disabled),
      config: e.config ?? null,
    }
    if (expr !== undefined) entry.disabledExpr = expr
    const ev = events[entry.id]
    if (ev !== undefined && ev.length > 0) entry.events = ev
    return entry
  })

  const replayById = new Map(entries.map(entry => [entry.id, entry]))
  const liveById = new Map(live.map(entry => [entry.id, entry]))
  const liveCounts = countById(live.map(entry => entry.id))
  const replayCounts = countById(entries.map(entry => entry.id))

  const missingInRuntime = entries.filter(entry => !liveById.has(entry.id)).map(entry => entry.id)
  const extraInRuntime = live.filter(entry => !replayById.has(entry.id)).map(entry => entry.id)

  // 短 id 在任一侧出现多次 = 比对对象不确定
  const ambiguous = [...new Set(
    [...liveCounts.keys(), ...replayCounts.keys()]
      .filter(id => (liveCounts.get(id) ?? 0) > 1 || (replayCounts.get(id) ?? 0) > 1),
  )].sort()
  const ambiguousSet = new Set(ambiguous)

  const unevaluated = entries.filter(entry => entry.disabledExpr !== undefined).map(entry => entry.id)
  const unevaluatedSet = new Set(unevaluated)

  const disabledMismatch = entries.filter(entry => {
    if (ambiguousSet.has(entry.id) || unevaluatedSet.has(entry.id)) return false
    const runtime = liveById.get(entry.id)
    return runtime !== undefined && runtime.disabled !== entry.disabled
  }).map(entry => entry.id)

  const driftReport = { missingInRuntime, extraInRuntime, disabledMismatch, ambiguous, unevaluated }
  // drift 只由真正的差异决定：ambiguous / unevaluated 是「没法比」，不是「不一致」
  const drift = missingInRuntime.length > 0 || extraInRuntime.length > 0 || disabledMismatch.length > 0
  return { entries, drift, driftReport }
}
