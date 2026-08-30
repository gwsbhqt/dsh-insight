/**
 * 工作台右栏：选中什么就展开什么的档案。固定在原地，不再用浮层盖住来源行。
 *
 * 依赖关系在这里的表达是「一度邻域 + 影响面」而不是画布——实测这张图是星形：
 * 148 条边、75 个插件不连任何人、无环、最深 4 层，前 6 个枢纽吃掉一半以上的边。
 * 枢纽的边必然横穿整张画布，换任何布局算法都是毛线球；而真正要回答的三个问题
 * （谁依赖我 / 我依赖谁 / 我关掉会炸什么）全是局部问题，列表比图清楚。
 */
import type { ReactNode } from 'react'
import { JsonTree } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginDossier } from '../../shared/dossier.ts'
import { buildGraphIndex, impactHops } from '../../shared/graph.ts'
import type { ToolPlugin } from '../../shared/tools.ts'
import { isForeign, vendorOf } from '../../shared/vendor.ts'
import type { ConfigFileInfo, LayerView, ModelInventory, PresetEntry, PresetInventory, PresetRow, ProviderRoute } from '../../shared/types.ts'
import type { ToolInventory } from '../../shared/types.ts'
import { FilePath } from './FilePath.tsx'
import { KIND_BAR, KIND_ORDER } from './kindTone.ts'
import { PanelStatus } from './PanelStatus.tsx'
import { TONE_TEXT } from './Tag.tsx'
import { disabledBy } from './Workbench.tsx'
import { basename, labelOf, shortOf, type Selection } from './WorkbenchList.tsx'


type Index = ReturnType<typeof buildGraphIndex>

export interface WorkbenchDetailProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
  selection: Selection | undefined
  query: string
  byId: Map<string, PluginDossier>
  index: Index
  layers: LayerView[]
  files: ConfigFileInfo[]
  tools: ToolPlugin[]
  inventory: ToolInventory | undefined
  models: ModelInventory | undefined
  presets: PresetInventory | undefined
  /** 属于「你」的那些配置层的 label——用来说清一条插件是谁关的。 */
  userLayers: ReadonlySet<string>
  /** 跨轴跳转（不是列表选中）：会切轴并放开筛选，所以只接受具体目标。 */
  onSelect: (next: Selection) => void
}

/* ── 通用小件 ── */

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-tertiary uppercase">{label}</p>
      {children}
    </div>
  )
}

function Head({ title, sub }: { title: string; sub?: string | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[15px] font-medium break-all">{title}</span>
      {sub !== undefined && sub !== '' && <span className="text-[12px] break-all text-tertiary">{sub}</span>}
    </div>
  )
}

function Link({ children, onClick, mono = false }: { children: ReactNode; onClick: () => void; mono?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border-0 border-b border-transparent bg-transparent p-0 text-brand-bright transition-colors duration-150 hover:border-current ${mono ? 'font-mono text-[11.5px]' : 'text-[12.5px]'}`}
    >
      {children}
    </button>
  )
}

function Pill({ children, onClick }: { children: ReactNode; onClick?: (() => void) | undefined }) {
  const cls = 'inline-flex shrink-0 items-center rounded px-1.5 py-px font-mono text-[11px] whitespace-nowrap bg-hover text-secondary'
  if (onClick === undefined) return <span className={cls}>{children}</span>
  return (
    <button type="button" onClick={onClick} className={`${cls} cursor-pointer transition-colors duration-150 hover:text-brand-bright`}>
      {children}
    </button>
  )
}

/* ── 入口 ── */

export function WorkbenchDetail(props: WorkbenchDetailProps) {
  const { t, selection, layers, files, byId } = props
  if (selection === undefined) return <Hint t={t} />
  if (selection.kind === 'layer') {
    const layer = layers[selection.index]
    return layer === undefined ? <Hint t={t} /> : <LayerDetail {...props} layer={layer} order={selection.index} />
  }
  if (selection.kind === 'file') {
    const file = files[selection.index]
    return file === undefined ? <Hint t={t} /> : <FileDetail {...props} file={file} />
  }
  if (selection.kind === 'service') return <ServiceDetail {...props} service={selection.service} />
  if (selection.kind === 'tool') {
    const tool = props.tools.find(x => x.id === selection.id)
    return tool === undefined ? <Hint t={t} /> : <ToolDetail {...props} tool={tool} />
  }
  if (selection.kind === 'toolName') {
    const info = props.inventory?.tools.find(x => x.name === selection.name && x.pkg === selection.pkg)
    return info === undefined ? <Hint t={t} /> : <ToolNameDetail {...props} info={info} />
  }
  if (selection.kind === 'model') {
    const m = props.models?.models.find(x => x.provider === selection.provider && x.id === selection.id)
    return m === undefined ? <Hint t={t} /> : <ModelDetail {...props} model={m} />
  }
  if (selection.kind === 'provider') {
    const p = props.models?.providers.find(x => x.id === selection.id)
    return p === undefined ? <Hint t={t} /> : <ProviderDetail {...props} route={p} />
  }
  if (selection.kind === 'preset') {
    const p = props.presets?.presets.find(x => x.id === selection.id)
    return p === undefined ? <Hint t={t} /> : <PresetDetail {...props} preset={p} />
  }
  const d = byId.get(selection.id)
  return d === undefined ? <Hint t={t} /> : <PluginDetail {...props} d={d} />
}

function Hint({ t }: { t: TranslateNS<'dsh-insight'> }) {
  return <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{t('detail.hint')}</p>
}

/* ── 插件档案 ── */

function PluginDetail({ ctx, t, d, query, index, byId, layers, onSelect, userLayers }: WorkbenchDetailProps & { d: PluginDossier }) {
  const layerIndexOf = (label: string): number => layers.findIndex(l => l.label === label)
  const ins = [...(index.dependedBy.get(d.id) ?? [])]
  const outs = [...(index.dependsOn.get(d.id) ?? [])]
  const twins = [...byId.values()].filter(x => x.shortId === d.shortId && x.id !== d.id)
  const hops = impactHops(index, d.id)
  const impact = hops.reduce((n, h) => n + h.length, 0)
  const goto = (id: string) => onSelect({ kind: 'plugin', id })

  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={labelOf(d)} sub={d.name} />
      <Verdict t={t} d={d} index={index} twins={twins.length} userLayers={userLayers} />

      {/* 容器行在列表里只是多了个折叠箭头，光看行看不出它是什么——在这儿说清楚。
          带包名的是「插件 + 容器」，不带包名的（cordis:group）就是个纯分组。 */}
      {d.group && (
        <div className="flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary">
          <span className="shrink-0 font-semibold text-tertiary">{t('plugins.container')}</span>
          <span>
            {d.children.length > 0
              ? t('plugins.containerNote', { count: d.children.length })
              : t('plugins.groupOnly')}
          </span>
        </div>
      )}

      {/* 不是插件的那些行必须自己说清楚，否则就是一行没有包名的「坏插件」 */}
      {d.settingsOnly === true && (
        <div className="flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary">
          <span className="shrink-0 font-semibold text-tertiary">{t('plugins.settingsOnly')}</span>
          <span>{t('plugins.settingsOnlyNote')}</span>
        </div>
      )}

      {/* 出处只在非官方时说话：165 个里 165 个是官方，天天挂一句「官方」等于没说 */}
      {isForeign(vendorOf(d)) && (
        <div className="flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary">
          <span className="shrink-0 font-semibold text-tertiary">{t(`vendor.${vendorOf(d)!}`)}</span>
          <span>{vendorOf(d) === 'local' ? t('vendor.localNote') : t('vendor.thirdPartyNote')}</span>
        </div>
      )}

      <dl className="m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]">
        {d.origin !== undefined && (
          <>
            <dt className="text-tertiary">{t('detail.origin')}</dt>
            <dd className="m-0 min-w-0 text-secondary">
              <Link onClick={() => {
                const at = layerIndexOf(d.origin!)
                if (at >= 0) onSelect({ kind: 'layer', index: at })
              }}>{d.origin}</Link>
            </dd>
          </>
        )}
        {d.id !== d.shortId && (
          <>
            <dt className="text-tertiary">{t('detail.fullId')}</dt>
            <dd className="m-0 min-w-0 font-mono text-[11.5px] break-all text-secondary">{d.id}</dd>
          </>
        )}
        {d.path !== undefined && (
          <>
            <dt className="text-tertiary">{t('detail.path')}</dt>
            <dd className="m-0 min-w-0"><FilePath ctx={ctx} t={t} path={d.path} highlight={query} isDir /></dd>
          </>
        )}
      </dl>

      {/* 撞名的另一半：直接给出对照并可互跳，比在别处解释「为什么状态对不上」有用得多 */}
      {twins.length > 0 && (
        <Section label={t('detail.twin')}>
          {twins.map(x => (
            <div key={x.id} className="text-[12.5px] text-secondary">
              <Link mono onClick={() => goto(x.id)}>{x.id}</Link>
              <span className="text-tertiary"> · {x.state === 'disabled' ? t('state.disabled') : t('state.active')}</span>
            </div>
          ))}
        </Section>
      )}

      <Wiring t={t} d={d} index={index} onSelect={onSelect} />

      {(ins.length > 0 || outs.length > 0) && (
        <Section label={t('detail.neighborhood')}>
          <Neighborhood t={t} label={labelOf(d)} ins={ins} outs={outs} index={index} onGoto={goto} />
        </Section>
      )}

      {impact > 1 && <Impact t={t} label={labelOf(d)} hops={hops} index={index} onGoto={goto} total={impact} />}

      {d.settings !== undefined && (
        <Section label={t('detail.settings')}>
          <JsonPanels t={t} ns={d.settings} />
        </Section>
      )}

      {d.intent?.events !== undefined && d.intent.events.length > 0 && (
        <Section label={t('detail.stack')}>
          <ol className="m-0 flex list-none flex-col gap-0.5 p-0 text-[12.5px]">
            {d.intent.events.map((ev, i) => (
              <li key={i} className="text-secondary">
                <span className="text-tertiary">{i + 1}.</span>{' '}
                <Link onClick={() => {
                  const at = layerIndexOf(ev.layer)
                  if (at >= 0) onSelect({ kind: 'layer', index: at })
                }}>{ev.layer}</Link>{' '}
                <span className={TONE_TEXT[({ insert: 'dim', update: 'info', disable: 'err', enable: 'dim' } as const)[ev.kind]]}>
                  {t(`event.${ev.kind}`)}
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {d.intent?.config !== null && d.intent?.config !== undefined && Object.keys(d.intent.config as object).length > 0 && (
        <Section label={t('detail.finalConfig')}>
          <JsonTree data={d.intent.config as object} label={d.shortId} />
        </Section>
      )}
    </div>
  )
}

/** 结论行：先说这插件到底怎么了，再给细节。正常态不出结论条。 */
function Verdict({ t, d, index, twins, userLayers }: { t: TranslateNS<'dsh-insight'>; d: PluginDossier; index: Index; twins: number; userLayers: ReadonlySet<string> }) {
  const missing = d.requires.filter(r => r.providers.length === 0 && index.serviceOf.get(r.service)?.builtin !== true).map(r => r.service)
  let tone = 'bg-hover text-secondary'
  let title = ''
  let body = ''
  if (d.state === 'failed') {
    tone = 'bg-hover text-err'; title = t('state.failed'); body = d.error?.message ?? ''
  } else if (d.state === 'pending' || d.state === 'loading') {
    tone = 'bg-hover text-warn'; title = t(`state.${d.state}`); body = t('detail.waitingNote')
  } else if (missing.length > 0) {
    tone = 'bg-hover text-err'; title = t('mark.missingProvider'); body = t('detail.missingNote', { services: missing.join('、') })
  } else if (d.drift === 'mismatch') {
    title = t('dossier.mismatch')
    body = twins > 0 ? t('detail.mismatchCollision', { count: twins + 1 }) : t('detail.mismatchExpr')
  } else if (d.drift === 'extra') {
    title = t('mark.runtime'); body = t('dossier.noIntent')
  } else if (d.state === 'disabled') {
    // 「谁关的」决定你接下来能做什么，所以标题就说是谁，正文说怎么撤
    const off = disabledBy(d, userLayers) ?? 'runtime'
    title = t(`off.${off}`); body = t(`off.${off}Note`)
  } else {
    return null
  }
  return (
    <div className={`flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${tone}`}>
      <span className="shrink-0 font-semibold">{title}</span>
      <span>{body}</span>
    </div>
  )
}

/** 提供 / 依赖：服务是插件之间真正的连接介质，所以这里以服务为单位。 */
function Wiring({ t, d, index, onSelect }: { t: TranslateNS<'dsh-insight'>; d: PluginDossier; index: Index; onSelect: (s: Selection) => void }) {
  if (d.provides.length === 0 && d.requires.length === 0) {
    return <p className="m-0 text-[11.5px] text-tertiary">{t('graph.isolated')}</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {d.provides.length > 0 && (
        <Section label={t('graph.provides')}>
          <div className="flex flex-col gap-1">
            {d.provides.map(s => (
              <div key={s.service} className="flex flex-wrap items-center gap-[7px] text-[12px]">
                <Pill onClick={() => onSelect({ kind: 'service', service: s.service })}>{s.service}</Pill>
                {s.consumers.length === 0
                  ? <span className="text-[11.5px] text-tertiary">{t('graph.noConsumer')}</span>
                  : s.consumers.length > 5
                    ? <><span className="text-[11px] text-caption">←</span><span className="text-[11.5px] text-tertiary">{t('detail.manyConsumers', { count: s.consumers.length })}</span></>
                    : <><span className="text-[11px] text-caption">←</span>{s.consumers.map(c => (
                        <Link key={c} mono onClick={() => onSelect({ kind: 'plugin', id: c })}>{shortOf(index, c)}</Link>
                      ))}</>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {d.requires.length > 0 && (
        <Section label={t('graph.requires')}>
          <div className="flex flex-col gap-1">
            {d.requires.map(s => (
              <div key={s.service} className="flex flex-wrap items-center gap-[7px] text-[12px]">
                <Pill onClick={() => onSelect({ kind: 'service', service: s.service })}>{s.service}</Pill>
                {s.providers.length === 0
                  ? <span className={`text-[11.5px] ${index.serviceOf.get(s.service)?.builtin === true ? 'text-tertiary' : 'text-err'}`}>
                      {index.serviceOf.get(s.service)?.builtin === true ? t('svc.builtinNote') : t('graph.noProvider')}
                    </span>
                  : <><span className="text-[11px] text-caption">→</span>{s.providers.map(pid => (
                      <Link key={pid} mono onClick={() => onSelect({ kind: 'plugin', id: pid })}>{shortOf(index, pid)}</Link>
                    ))}</>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

/** 一度邻域：竖排三段。420px 宽塞不下三列，而上下游关系用「上面 / 中间 / 下面」一样清楚。 */
function Neighborhood({ t, label, ins, outs, index, onGoto }: {
  t: TranslateNS<'dsh-insight'>
  label: string
  ins: string[]
  outs: string[]
  index: Index
  onGoto: (id: string) => void
}) {
  const cap = (ids: string[], n: number) => (
    <div className="flex flex-wrap gap-[3px]">
      {ids.slice(0, n).map(id => <Pill key={id} onClick={() => onGoto(id)}>{shortOf(index, id)}</Pill>)}
      {ids.length > n && <span className="inline-flex items-center rounded bg-hover px-1.5 py-px font-mono text-[11px] text-tertiary">+{ids.length - n}</span>}
    </div>
  )
  const role = ins.length > 0 && outs.length > 0 ? t('nb.middle') : ins.length > 0 ? t('nb.base') : t('nb.leaf')
  return (
    <div className="overflow-hidden rounded-[10px] border border-line">
      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        <span className="flex items-center gap-1.5 text-[11px] text-tertiary">
          <span>↓</span>{t('nb.dependedBy')} <b className="font-medium text-tertiary tabular-nums">{ins.length}</b>
        </span>
        {ins.length > 0 ? cap(ins, 12) : <span className="text-[11.5px] text-secondary">{t('nb.noneIn')}</span>}
      </div>
      <div className="flex items-center gap-2 border-y border-line bg-hover px-2.5 py-2">
        <span className="shrink-0 text-[11px] text-caption">▸</span>
        <span className="font-mono text-[12.5px] font-semibold break-all">{label}</span>
        <span className="ml-auto shrink-0 text-[10.5px] text-tertiary">{role}</span>
      </div>
      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        <span className="flex items-center gap-1.5 text-[11px] text-tertiary">
          <span>↓</span>{t('nb.dependsOn')} <b className="font-medium text-tertiary tabular-nums">{outs.length}</b>
        </span>
        {outs.length > 0 ? cap(outs, 12) : <span className="text-[11.5px] text-secondary">{t('nb.noneOut')}</span>}
      </div>
    </div>
  )
}

/** 影响面：唯一真需要图算法的问题，但输出是按跳数分组的列表。 */
function Impact({ t, label, hops, index, onGoto, total }: {
  t: TranslateNS<'dsh-insight'>
  label: string
  hops: string[][]
  index: Index
  onGoto: (id: string) => void
  total: number
}) {
  return (
    <div>
      <details className="overflow-hidden rounded-[10px] border border-line">
        <summary className="dsh-summary flex cursor-pointer list-none items-center gap-2 bg-hover px-2.5 py-2 text-[12.5px] text-secondary select-none [&::-webkit-details-marker]:hidden">
          <span className="dsh-chevron inline-flex shrink-0 items-center text-tertiary"><ChevronMini /></span>
          {t('impact.title', { name: label })} <b className="font-semibold tabular-nums text-primary">{total}</b>
        </summary>
        <div className="flex flex-col gap-2.5 px-2.5 py-2.5">
          {hops.map((hop, i) => (
            <div key={i}>
              <div className="mb-1 font-mono text-[11px] tracking-[0.06em] text-tertiary">{t('impact.hop', { n: i + 1, count: hop.length })}</div>
              <div className="flex flex-wrap gap-1">
                {hop.map(id => <Pill key={id} onClick={() => onGoto(id)}>{shortOf(index, id)}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

function ChevronMini() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function JsonPanels({ t, ns }: { t: TranslateNS<'dsh-insight'>; ns: NonNullable<PluginDossier['settings']> }) {
  const rows: [string, unknown][] = [[t('settings.effective'), ns.value]]
  if (ns.base !== undefined) rows.push([t('settings.base'), ns.base])
  if (ns.user !== undefined) rows.push([t('settings.user'), ns.user])
  return (
    <div className="flex flex-col gap-2">
      {ns.secrets.length > 0 && (
        <p className="m-0 flex flex-wrap items-center gap-1 text-[11.5px] text-tertiary">
          {t('settings.secrets')}
          {ns.secrets.map(s => <Pill key={s.path}>{s.path}：{s.set ? '***' : t('settings.secretUnset')}</Pill>)}
        </p>
      )}
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-[11.5px] text-tertiary">{label}</span>
          <JsonTree data={(value ?? null) as object} label={label} />
        </div>
      ))}
    </div>
  )
}

/* ── 层详情 ── */

function LayerDetail({ ctx, t, layer, order, query, layers, index, onSelect }: WorkbenchDetailProps & { layer: LayerView; order: number }) {
  const groups = KIND_ORDER.map(k => [k, layer.hits.filter(h => h.kind === k).map(h => h.id)] as const).filter(([, ids]) => ids.length > 0)
  return (
    <div className="flex flex-col gap-[15px]">
      <Head
        title={layer.label}
        sub={`${t('layers.order', { n: order + 1 })} · ${layer.kind === 'profile' ? t('layers.profileLayer') : t('layers.bundleLayer')} · ${layer.readonly ? t('layers.readonly') : t('layers.writable')}`}
      />
      {layer.patchPath !== undefined && (
        <Section label={t('detail.path')}>
          <FilePath ctx={ctx} t={t} path={layer.patchPath} highlight={query} />
        </Section>
      )}
      {groups.map(([kind, ids]) => (
        <div key={kind} className={`flex flex-col gap-1.5 border-l-2 pl-2.5 ${KIND_BAR[kind]}`}>
          <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-tertiary uppercase">{t(`event.${kind}`)} {ids.length}</p>
          <div className="flex flex-wrap gap-1">
            {ids.map(id => {
              const target = [...index.dependsOn.keys()].find(k => k === id || k.endsWith(`:${id}`))
              return (
                <Pill key={id} onClick={target === undefined ? undefined : () => onSelect({ kind: 'plugin', id: target })}>{id}</Pill>
              )
            })}
          </div>
        </div>
      ))}
      {groups.every(([kind]) => kind === 'insert') && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{t('layers.onlyInserts')}</p>
      )}
      {layers.length > 0 && order === layers.length - 1 && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{t('layers.highestNote')}</p>
      )}
    </div>
  )
}

/* ── 服务详情 ── */

function ServiceDetail({ t, service, index, byId, onSelect }: WorkbenchDetailProps & { service: string }) {
  const entry = index.serviceOf.get(service)
  if (entry === undefined) return <PanelStatus kind="empty" text={t('status.noMatch')} />
  const provider = entry.provider === undefined ? undefined : byId.get(entry.provider)
  const hops = entry.provider === undefined ? [] : impactHops(index, entry.provider)
  const total = hops.reduce((n, h) => n + h.length, 0)
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={service} sub={t('svc.sub', { count: entry.consumers.length })} />
      <Section label={t('svc.provider')}>
        {provider !== undefined ? (
          <div className="text-[12.5px]">
            <Link mono onClick={() => onSelect({ kind: 'plugin', id: provider.id })}>{labelOf(provider)}</Link>
            <span className="text-[12px] text-tertiary"> · {provider.name}</span>
          </div>
        ) : entry.candidates !== undefined ? (
          <div className="flex flex-wrap gap-1">
            {entry.candidates.map(id => <Pill key={id} onClick={() => onSelect({ kind: 'plugin', id })}>{shortOf(index, id)}</Pill>)}
          </div>
        ) : (
          <p className="m-0 text-[11.5px] text-secondary">{entry.builtin ? t('svc.builtinNote') : t('graph.noProvider')}</p>
        )}
      </Section>
      <Section label={t('svc.consumersN', { count: entry.consumers.length })}>
        {entry.consumers.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {entry.consumers.map(id => <Pill key={id} onClick={() => onSelect({ kind: 'plugin', id })}>{shortOf(index, id)}</Pill>)}
          </div>
        ) : (
          <p className="m-0 text-[11.5px] text-secondary">{t('svc.unusedNote')}</p>
        )}
      </Section>
      {provider !== undefined && total > 1 && (
        <Impact t={t} label={labelOf(provider)} hops={hops} index={index} total={total} onGoto={id => onSelect({ kind: 'plugin', id })} />
      )}
    </div>
  )
}

/* ── 单个工具 ── */

/** 一个工具名的档案：它由谁注册、那个插件在哪一层被插入 / 被禁用、来源可不可靠。 */
function ToolNameDetail(props: WorkbenchDetailProps & { info: NonNullable<ToolInventory['tools']>[number] }) {
  const { t, info, tools, inventory, onSelect } = props
  const owner = info.plugin === undefined ? undefined : tools.find(x => x.id === info.plugin)
  // 跳转落点是「按插件」里的那一条 entry——工具本身关不掉，能关的是注册它的插件。
  // 同名多份（宿主面 / 预设 realm）时挑活着的那一份：跳到已经被禁掉的副本上等于死链接。
  const ownerEntry = owner === undefined ? undefined : owner.entries.find(e => e.state === 'active') ?? owner.entries[0]
  // 同插件的其他工具：关掉这个插件会一起消失，取舍时必须先看见
  const key = info.plugin ?? info.pkg
  const siblings = (inventory?.tools ?? []).filter(x => (x.plugin ?? x.pkg) === key && x.name !== info.name)
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={info.name} sub={info.description} />

      {owner !== undefined && (
        <div className={`flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${owner.enabled ? 'bg-hover text-secondary' : 'bg-hover text-warn'}`}>
          <span className="shrink-0 font-semibold">{owner.enabled ? t('tool.enabled') : t('tool.disabled')}</span>
          <span>{owner.enabled ? t('tool.enabledNote') : t('tool.disabledNote')}</span>
        </div>
      )}

      <dl className="m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]">
        <dt className="text-tertiary">{t('tool.from')}</dt>
        <dd className="m-0 min-w-0 text-secondary">
          {owner === undefined || ownerEntry === undefined
            ? <span className="font-mono text-[11.5px]">{info.pkg ?? '—'}</span>
            : <Link mono onClick={() => onSelect({ kind: 'plugin', id: ownerEntry.id })}>{owner.id}</Link>}
          {info.pkg !== undefined && owner !== undefined && (
            <span className="text-[11.5px] text-tertiary"> · {info.pkg}</span>
          )}
        </dd>
        <dt className="text-tertiary">{t('tool.source')}</dt>
        <dd className="m-0 min-w-0 text-secondary">
          {info.source === 'runtime' ? t('tool.srcRuntimeNote') : t('tool.srcScanNote')}
        </dd>
      </dl>

      {siblings.length > 0 && (
        <Section label={t('tool.siblingsHead', { count: siblings.length })}>
          <div className="flex flex-wrap gap-1">
            {siblings.map(x => (
              <Pill key={x.name} onClick={() => onSelect({ kind: 'toolName', name: x.name, pkg: x.pkg })}>{x.name}</Pill>
            ))}
          </div>
        </Section>
      )}

      {/* 要关掉这个工具，落点是那个插件——直接给到跳转，并说清连带范围 */}
      {owner !== undefined && (
        <p className="m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary">
          {siblings.length > 0
            ? t('tool.siblingsNote', { plugin: owner.id, count: siblings.length + 1 })
            : t('tool.howToDisable')}
        </p>
      )}
    </div>
  )
}

/* ── 工具插件 ── */

/**
 * 「谁提供、谁开、谁禁」的三段回答：
 *   谁提供 —— 哪个包、哪一层插进来的
 *   谁开谁禁 —— 每一份 entry 的运行状态 + 配置层对这个 id 做过什么
 * 最后诚实说明这一层的边界：插件实际注册了哪些工具名，静态拿不到。
 */
function ToolDetail({ t, tool, layers, byId, onSelect }: WorkbenchDetailProps & { tool: ToolPlugin }) {
  // 配置层对这个短 id 做过什么（插入 / 覆盖 / 禁用），按层序
  const acts = layers
    .map((l, i) => ({ order: i + 1, label: l.label, hits: l.hits.filter(h => h.id === tool.id) }))
    .filter(x => x.hits.length > 0)
  const KN = { insert: 'k-ins', update: 'k-upd', disable: 'k-dis', enable: 'k-ena' } as const
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={tool.id} sub={tool.name} />

      <div className={`flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${tool.enabled ? 'bg-hover text-secondary' : 'bg-hover text-warn'}`}>
        <span className="shrink-0 font-semibold">{tool.enabled ? t('tool.enabled') : t('tool.disabled')}</span>
        <span>{tool.split ? t('tool.splitNote') : tool.enabled ? t('tool.enabledNote') : t('tool.disabledNote')}</span>
      </div>

      {/* 谁开谁禁：每一份 entry 的运行状态 */}
      <Section label={t('tool.entries', { count: tool.entries.length })}>
        <div className="flex flex-col gap-1.5">
          {tool.entries.map(e => (
            <div key={e.id} className="flex flex-wrap items-baseline gap-2 text-[12.5px]">
              <span className="text-[11.5px] text-dimmed">{e.realm === '' ? t('tool.hostPlane') : e.realm}</span>
              <Link mono onClick={() => onSelect({ kind: 'plugin', id: e.id })}>{e.id}</Link>
              <span className={e.state === 'active' ? 'text-tertiary' : 'text-warn'}>
                {e.state === undefined ? '' : t(`state.${e.state}`)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 谁提供：来源层 + 配置层对它做过什么 */}
      {acts.length > 0 && (
        <Section label={t('tool.acts')}>
          <ol className="m-0 flex list-none flex-col gap-0.5 p-0 text-[12.5px]">
            {acts.map(a => (
              <li key={a.order} className="text-secondary">
                <span className="text-dimmed">{a.order}.</span>{' '}
                <Link onClick={() => onSelect({ kind: 'layer', index: a.order - 1 })}>{a.label}</Link>{' '}
                {a.hits.map(h => (
                  <span key={h.kind} className={TONE_TEXT[({ insert: 'dim', update: 'info', disable: 'err', enable: 'dim' } as const)[h.kind]]}>
                    {t(`event.${h.kind}`)}{' '}
                  </span>
                ))}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {tool.path !== undefined && (
        <Section label={t('detail.path')}>
          <span className="font-mono text-[11.5px] leading-[1.55] break-all text-tertiary">{tool.path}</span>
        </Section>
      )}

      {/* 边界说明：不假装这是工具清单 */}
      <p className="m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary">
        {t('tool.limitNote')}
      </p>
    </div>
  )
}

/* ── 不参与合并的配置文件 ── */

function FileDetail({ ctx, t, file, query }: WorkbenchDetailProps & { file: ConfigFileInfo }) {
  const roleKey = ({ 'root-config': 'files.rootConfig', settings: 'files.settings', credentials: 'files.credentials', patch: 'files.patch' } as const)[file.role]
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={basename(file.path)} sub={`${t(roleKey)} · ${t('layers.notMergedNote')}`} />
      <Section label={t('detail.path')}>
        <FilePath ctx={ctx} t={t} path={file.path} highlight={query} previewable={file.previewable} openable={file.role !== 'credentials'} />
      </Section>
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill>{(file.size / 1024).toFixed(1)} KB</Pill>
        {!file.previewable && <Pill>{t('files.credentialsNote')}</Pill>}
      </div>
      <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{t('files.notMergedWhy')}</p>
    </div>
  )
}

/* ── 模型 ── */

/** provider 是哪个插件声明的：settingsNs 就是那个插件的短 id，上游直接给的，不用猜。 */
function pluginOfRoute(route: ProviderRoute | undefined, byId: Map<string, PluginDossier>): PluginDossier | undefined {
  if (route?.settingsNs === undefined) return undefined
  for (const d of byId.values()) if (d.shortId === route.settingsNs && d.state === 'active') return d
  for (const d of byId.values()) if (d.shortId === route.settingsNs) return d
  return undefined
}

/**
 * 激活方式。写清楚是「环境变量里的 key」还是「登录换来的授权」——这两件事出问题
 * 的排查路径完全不同：前者去看环境变量，后者去重新登录。
 * 只显示环境变量的**名字**，值一次也不经手（host 那边连读都没读）。
 */
function AuthLine({ t, route }: { t: TranslateNS<'dsh-insight'>; route: ProviderRoute }) {
  if (route.auth === undefined) return null
  return (
    <span className="text-secondary">
      {t(`auth.${route.auth}`)}
      {route.auth === 'env' && route.authEnv !== undefined && (
        <span className="ml-1.5 font-mono text-[11.5px] text-tertiary">{route.authEnv}</span>
      )}
    </span>
  )
}

/** 配置落点：`llm-pi-ai › providers › kimi-coding`，照着这条路径去 settings 里找。 */
function ConfigAt({ route }: { route: ProviderRoute }) {
  const parts = [route.settingsNs ?? '', ...(route.settingsPath ?? [])].filter(x => x !== '')
  if (parts.length === 0) return null
  return (
    <span className="font-mono text-[11.5px] leading-[1.55] break-all text-secondary">
      {parts.join(' › ')}
    </span>
  )
}

/**
 * 一个模型的档案。要回答的和工具那边是同一组问题——从哪来、现在算不算数、
 * 关掉会连带什么——只是这里每一跳都有上游正经答案，不需要标注可信度。
 */
function ModelDetail(props: WorkbenchDetailProps & { model: NonNullable<ModelInventory['models']>[number] }) {
  const { t, model, models, byId, onSelect } = props
  const route = models?.providers.find(p => p.id === model.provider)
  const plugin = pluginOfRoute(route, byId)
  const siblings = (models?.models ?? []).filter(m => m.provider === model.provider && m.id !== model.id)
  const current = models?.default?.provider === model.provider && models.default.model === model.id
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={model.id} sub={model.name === model.id ? undefined : model.name} />

      {current && (
        <div className="flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary">
          <span className="shrink-0 font-semibold text-brand-bright">{t('model.default')}</span>
          <span>{t('model.defaultNote', { effort: models?.default?.reasoningEffort ?? '' })}</span>
        </div>
      )}

      <dl className="m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]">
        <dt className="text-tertiary">{t('model.from')}</dt>
        <dd className="m-0 min-w-0 text-secondary">
          <span className="font-mono text-[11.5px]">{model.provider}</span>
          {route?.name !== undefined && route.name !== model.provider && (
            <span className="text-[11.5px] text-tertiary"> · {route.name}</span>
          )}
        </dd>
        {route?.auth !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.auth')}</dt>
            <dd className="m-0 min-w-0"><AuthLine t={t} route={route} /></dd>
          </>
        )}
        {plugin !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.plugin')}</dt>
            <dd className="m-0 min-w-0 text-secondary">
              <Link mono onClick={() => onSelect({ kind: 'plugin', id: plugin.id })}>{labelOf(plugin)}</Link>
              <span className="text-[11.5px] text-tertiary"> · {plugin.name}</span>
            </dd>
          </>
        )}
        {route !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.configAt')}</dt>
            <dd className="m-0 min-w-0"><ConfigAt route={route} /></dd>
          </>
        )}
        {model.inputModalities !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.modalities')}</dt>
            <dd className="m-0 min-w-0 text-secondary">{model.inputModalities.join(' · ')}</dd>
          </>
        )}
      </dl>

      {model.description !== undefined && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{model.description}</p>
      )}

      {siblings.length > 0 && (
        <Section label={t('model.siblingsHead', { count: siblings.length, provider: model.provider })}>
          <div className="flex flex-wrap gap-1">
            {siblings.map(m => (
              <Pill key={m.id} onClick={() => onSelect({ kind: 'model', provider: m.provider, id: m.id })}>{m.id}</Pill>
            ))}
          </div>
        </Section>
      )}

      {/* 落点：换默认模型改哪儿、整条 provider 关掉是什么后果 */}
      <p className="m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary">
        {plugin === undefined
          ? t('model.howToSwitch')
          : t('model.siblingsNote', { plugin: labelOf(plugin), count: siblings.length + 1 })}
      </p>
    </div>
  )
}

/** 一条 provider 路由的档案：接线了但没模型，或者声明了可配却还没配。 */
function ProviderDetail(props: WorkbenchDetailProps & { route: ProviderRoute }) {
  const { t, route, models, byId, onSelect } = props
  const plugin = pluginOfRoute(route, byId)
  const mine = (models?.models ?? []).filter(m => m.provider === route.id)
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={route.id} sub={route.name === route.id ? undefined : route.name} />

      {/* 接线了却报不出模型是异常，标 warn；声明了没配只是「你还没用」，不该报警 */}
      <div className="flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary">
        <span className={`shrink-0 font-semibold ${route.wired ? 'text-warn' : 'text-tertiary'}`}>
          {route.wired ? t('model.wired') : t('model.unwired')}
        </span>
        <span>{route.wired ? t('model.noModelsNote') : t('model.dormantNote')}</span>
      </div>

      <dl className="m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]">
        {route.auth !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.auth')}</dt>
            <dd className="m-0 min-w-0"><AuthLine t={t} route={route} /></dd>
          </>
        )}
        {plugin !== undefined && (
          <>
            <dt className="text-tertiary">{t('model.plugin')}</dt>
            <dd className="m-0 min-w-0 text-secondary">
              <Link mono onClick={() => onSelect({ kind: 'plugin', id: plugin.id })}>{labelOf(plugin)}</Link>
              <span className="text-[11.5px] text-tertiary"> · {plugin.name}</span>
            </dd>
          </>
        )}
        <dt className="text-tertiary">{t('model.configAt')}</dt>
        <dd className="m-0 min-w-0"><ConfigAt route={route} /></dd>
      </dl>

      {mine.length > 0 && (
        <Section label={t('model.siblingsHead', { count: mine.length, provider: route.id })}>
          <div className="flex flex-wrap gap-1">
            {mine.map(m => (
              <Pill key={m.id} onClick={() => onSelect({ kind: 'model', provider: m.provider, id: m.id })}>{m.id}</Pill>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

/* ── 预设 ── */

/**
 * 一个包名在插件树里的落点。
 *
 * 为什么按**包名**找而不按短 id：预设挂上去之后，同一个短 id 在树里会有两份
 * （宿主面的 `include:tool-bash` 和挂载的 `include:agent-presets:tool-bash`），
 * 短 id 认不出该跳哪一个——这正是这个仓库对撞名一贯的态度。包名唯一，
 * 而这一跳要回答的问题（这个包是什么、装在哪、连着谁）在两份之间是同一个答案。
 *
 * 挑哪一份：先要活着的（跳到已经被禁掉的副本上等于死链接），再要 id 最短的
 * ——宿主面那条比挂载那条短，它更稳定，不随预设换来换去。
 */
function entryForPackage(byId: Map<string, PluginDossier>, name: string): PluginDossier | undefined {
  if (name === '' || name.startsWith('cordis:')) return undefined
  let best: PluginDossier | undefined
  for (const d of byId.values()) {
    if (d.name !== name) continue
    if (best === undefined) { best = d; continue }
    const better = (d.state === 'active') !== (best.state === 'active')
      ? d.state === 'active'
      : d.id.length < best.id.length
    if (better) best = d
  }
  return best
}

/** composition 的一行。容器行往下缩进，不给它自己上颜色——它只是个盒子。 */
function PresetRowLine({ t, row, depth, byId, onSelect }: {
  t: TranslateNS<'dsh-insight'>
  row: PresetEntry
  depth: number
  byId: Map<string, PluginDossier>
  onSelect: (next: Selection) => void
}) {
  const off = row.disabled
  const target = row.group ? undefined : entryForPackage(byId, row.name)
  return (
    <>
      <div
        className="flex min-w-0 items-baseline gap-2 py-[3px] text-[11.5px] leading-[1.5]"
        style={{ paddingLeft: `${String(depth * 14)}px` }}
      >
        <span className={`shrink-0 font-mono ${off ? 'text-dimmed line-through' : row.group ? 'text-tertiary' : 'text-secondary'}`}>
          {row.id === '' ? '—' : row.id}
        </span>
        {row.group ? (
          <span className="shrink-0 text-[11px] text-tertiary">
            {t('preset.group')}
            {row.isolate !== undefined && ` · ${t('preset.isolate')} ${row.isolate.join(', ')}`}
          </span>
        ) : target === undefined ? (
          // 树里找不到对应的包就只给文字：跳不过去的链接比没有链接更糟
          <span className="min-w-0 truncate font-mono text-[11px] text-tertiary">{row.name}</span>
        ) : (
          <span className="min-w-0 truncate">
            <Link mono onClick={() => onSelect({ kind: 'plugin', id: target.id })}>{row.name}</Link>
          </span>
        )}
        {/* 表达式开关：静态侧不求值，所以不说它开着还是关着，只说「得看运行时」 */}
        {row.disabledExpr !== undefined && (
          <span className="ml-auto shrink-0 font-mono text-[10.5px] text-tertiary">!!js</span>
        )}
      </div>
      {row.children?.map((child, i) => (
        <PresetRowLine key={`${child.id}/${String(i)}`} t={t} row={child} depth={depth + 1} byId={byId} onSelect={onSelect} />
      ))}
    </>
  )
}

/**
 * 一个预设的档案。
 *
 * 顺序按「问的人最先想知道什么」排：这是什么 → 谁给的 → 文件在哪 → 里面装了什么。
 * 出处那一段要说两件不同的事：上游记的 trust（发行带的 / 本地写的）和我们按磁盘
 * 位置判的 vendor（官方 / 三方 / 本地）。它们经常一致，但不一致的那种情况才是重点：
 * 一个三方插件带进来的预设，上游也记成 `system`。
 */
function PresetDetail({ ctx, t, preset, query, presets, byId, onSelect }: WorkbenchDetailProps & { preset: PresetRow }) {
  const root = presets?.roots.find(r => r.path === preset.root)
  return (
    <div className="flex flex-col gap-[15px]">
      <Head title={preset.name ?? preset.id} sub={preset.name === undefined ? undefined : preset.id} />

      {preset.description !== undefined && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">{preset.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {preset.isDefault && <Pill>{t('preset.default')}</Pill>}
        {preset.plugins !== undefined && <Pill>{preset.plugins} {t('preset.plugins')}</Pill>}
        {isForeign(preset.vendor) && <Pill>{t(`vendor.${preset.vendor}`)}</Pill>}
        {preset.bytes !== undefined && <Pill>{(preset.bytes / 1024).toFixed(1)} KB</Pill>}
      </div>

      {preset.broken !== undefined && (
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[12.5px] leading-[1.6] text-warn">{t('preset.brokenNote', { reason: preset.broken })}</p>
          <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('preset.brokenWhy')}</p>
        </div>
      )}

      <Section label={t('vendor.head')}>
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">
          {t(`preset.trust.${preset.trust}`)}
          {preset.pkg !== undefined && <span className="ml-1.5 font-mono text-[11.5px] text-tertiary">{preset.pkg}</span>}
        </p>
        {preset.vendor === 'third-party' && (
          <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('vendor.thirdPartyNote')}</p>
        )}
        {preset.trust === 'user' && (
          <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('preset.userTrustNote')}</p>
        )}
        {preset.isDefault && (
          <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('preset.defaultNote')}</p>
        )}
      </Section>

      <Section label={t('preset.sessions')}>
        <p className="m-0 text-[12.5px] leading-[1.6] text-secondary">
          {preset.sessions === undefined
            ? t('preset.sessionsUnknown')
            : preset.sessions === 0 ? t('preset.noSessions') : t('preset.inUse', { count: preset.sessions })}
        </p>
      </Section>

      <Section label={t('preset.dir')}>
        <FilePath ctx={ctx} t={t} path={preset.dir} highlight={query} isDir />
      </Section>

      <Section label={t('preset.file')}>
        <FilePath ctx={ctx} t={t} path={preset.path} highlight={query} />
      </Section>

      {preset.metaPath !== undefined && (
        <Section label={t('preset.meta')}>
          <FilePath ctx={ctx} t={t} path={preset.metaPath} highlight={query} />
        </Section>
      )}

      {root !== undefined && (
        <Section label={t('preset.root')}>
          <FilePath ctx={ctx} t={t} path={root.path} highlight={query} isDir />
          <span className="text-[11.5px] text-tertiary">{t('preset.rootCount', { count: root.count })}</span>
        </Section>
      )}

      {preset.rowsError !== undefined && (
        <p className="m-0 text-[12.5px] leading-[1.6] text-warn">{t('preset.rowsError', { message: preset.rowsError })}</p>
      )}

      {preset.rows !== undefined && preset.rows.length > 0 && (
        <Section label={`${t('preset.composition')} · ${String(preset.plugins ?? 0)}`}>
          <div className="flex flex-col rounded-lg border border-line bg-surface-2 px-2.5 py-2">
            {preset.rows.map((row, i) => (
              <PresetRowLine key={`${row.id}/${String(i)}`} t={t} row={row} depth={0} byId={byId} onSelect={onSelect} />
            ))}
          </div>
          <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('preset.planeNote')}</p>
          {preset.rows.some(r => hasExpr(r)) && (
            <p className="m-0 text-[11.5px] leading-[1.55] text-tertiary">{t('preset.exprNote')}</p>
          )}
        </Section>
      )}
    </div>
  )
}

/** 这棵子树里有没有「开关是表达式」的行——有才值得多说那一句。 */
function hasExpr(row: PresetEntry): boolean {
  return row.disabledExpr !== undefined || (row.children ?? []).some(hasExpr)
}
