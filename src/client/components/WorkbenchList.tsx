/**
 * 工作台左栏：同一份数据的三种排列。
 *
 * 行的表达遵守 Tag.tsx 里的视觉契约——**正常态零颜色、零标签**。
 * 旧实现里 169 行会渲染出 224 个彩色标签，其中「提供 N」「依赖 N」占 127 个：
 * 出现在近半数行上的东西是常量不是信号，它们进右栏详情，不进列表。
 */
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginDossier } from '../../shared/dossier.ts'
import { walkDossiers } from '../../shared/dossier.ts'
import type { buildGraphIndex } from '../../shared/graph.ts'
import type { ToolPlugin } from '../../shared/tools.ts'
import { isForeign, vendorOf, type Vendor, type VendorIndex } from '../../shared/vendor.ts'
import type { ConfigFileInfo, LayerView, ModelInventory, PresetInventory, ToolInventory } from '../../shared/types.ts'
import { KIND_ORDER, KIND_TONE } from './kindTone.ts'
import { EmptyState } from './EmptyState.tsx'
import { PanelStatus } from './PanelStatus.tsx'
import { TONE_TEXT } from './Tag.tsx'
import { TruncText } from './TruncText.tsx'
import { ChevronBox, Column, EndCell, GroupRow, INDENT_STEP, Marks, Meter, NameCell, ROW_PAD, Row, SubCell, Table } from './WorkbenchTable.tsx'
import { disabledBy, hasUserOverride, isAttention, type Axis, type FilterId } from './Workbench.tsx'

export type Selection =
  | { kind: 'plugin'; id: string }
  | { kind: 'layer'; index: number }
  | { kind: 'service'; service: string }
  | { kind: 'file'; index: number }
  | { kind: 'tool'; id: string }
  | { kind: 'toolName'; name: string; pkg?: string | undefined }
  | { kind: 'model'; provider: string; id: string }
  | { kind: 'provider'; id: string }
  | { kind: 'preset'; id: string }

type Index = ReturnType<typeof buildGraphIndex>

/**
 * 禁用 / 启用那一列要的全部状态。
 *
 * 住在工作台而不是各行自己的 useState 里，原因和展开状态一样：同一时刻只该有一行
 * 停在确认态，各行自持的话会同时亮好几个「确认」。
 */
export interface ToggleControl {
  /** host 认不认识这个写入端点。不认识时整列画出来但按不动，并说清是版本错位。 */
  supported: boolean
  /** 正停在确认态的那一行完整 id。 */
  pending?: string | undefined
  /** 正在写盘的那一行完整 id。 */
  busy?: string | undefined
  /**
   * 这一行为什么按不动；能点就是 undefined。
   *
   * 三种理由分开，因为你能做的事完全不同：`not-in-config` 是手写也没用，
   * `twins` 是面板分不清你点哪一行但手写有效，`dup-in-config` 是配置本身有重名。
   */
  blockedBy: (d: PluginDossier) => 'not-in-config' | 'twins' | 'dup-in-config' | undefined
  /** 点一下：第一次进确认态，第二次真写。 */
  onToggle: (d: PluginDossier) => void
  /** 撤掉确认态：鼠标移开 / 失焦时调，和 2 秒定时器一起兜。 */
  onCancel: () => void
}

/**
 * 展开/折叠状态。**不放在各轴自己的 useState 里**——跳转要能把目标所在的分组
 * 展开（否则跳过去那一行根本不在 DOM 里），所以这份状态得由工作台持有。
 */
export interface Expansion {
  /**
   * 展开着的折叠组 id。容器和「已禁用 N 条」共用这一份——按插件那一轴每层
   * 都有自己的禁用组，一个布尔管不过来（点开一个会把所有层的都点开）。
   */
  groups: ReadonlySet<string>
  toggleGroup: (id: string) => void
  /** 「已禁用 N 个」折叠组（按工具）。 */
  offTools: boolean
  toggleOffTools: () => void
  /** 「可配未配的 provider N 个」折叠组（按模型）。 */
  dormant: boolean
  toggleDormant: () => void
}

/** loader 给匿名 entry 生成的 8 位 hash 无信息量，有包名时包名升为主标题。 */
const HASH_ID = /^[0-9a-f]{8}$/i
export function labelOf(d: PluginDossier): string {
  return HASH_ID.test(d.shortId) && d.name !== '' ? d.name : d.shortId
}
export function basename(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export interface WorkbenchListProps {
  t: TranslateNS<'dsh-insight'>
  axis: Axis
  filter: FilterId
  /** 归一化后的小写搜索词。 */
  query: string
  /** 原始搜索词（高亮用）。 */
  rawQuery: string
  dossiers: PluginDossier[]
  index: Index
  layers: LayerView[]
  files: ConfigFileInfo[]
  tools: ToolPlugin[]
  inventory: ToolInventory | undefined
  models: ModelInventory | undefined
  /** host 还不认识 models/list：空态要说清是版本错位，不是「没有模型」。 */
  modelsStale: boolean
  presets: PresetInventory | undefined
  /** host 还不认识 presets/list：同上，空态要说清是版本错位。 */
  presetsStale: boolean
  /** 包的出处。每根轴手里的线索不同，规则只有这一份。 */
  vendors: VendorIndex
  /** 「按插件」那一列的禁用 / 启用控制面。 */
  toggle: ToggleControl
  /** 属于「你」的那些配置层的 label —— 「你禁用」这个筛选靠它判。 */
  userLayers: ReadonlySet<string>
  selection: Selection | undefined
  expand: Expansion
  onSelect: (next: Selection | undefined) => void
  /** 跨轴跳转：会切轴并放开筛选。空态里那种「去看另一根轴上的某一条」用它，
      onSelect 只换右栏，左边列表不动——那会让人以为链接没生效。 */
  onJump: (next: Selection) => void
}

export function WorkbenchList(props: WorkbenchListProps) {
  if (props.axis === 'layer') return <LayerRail {...props} />
  if (props.axis === 'svc') return <ServiceTable {...props} />
  if (props.axis === 'tool') return <ToolTable {...props} />
  if (props.axis === 'model') return <ModelTable {...props} />
  if (props.axis === 'preset') return <PresetTable {...props} />
  return <PluginRows {...props} />
}

/** 折叠箭头。translate-y-px 是光学补偿：盒中心已经对齐，但正文有降部（g/p）
 * 把墨迹重心压低，几何居中的箭头看起来偏高，下沉 1px 才是视觉齐平。 */
/* ─────────────────────────── 按插件 ─────────────────────────── */

interface Row {
  key: string
  kind: 'plugin' | 'realm' | 'sunk'
  depth: number
  d?: PluginDossier
  count?: number
  /** kind='sunk' 时这一组自己的折叠 key。每层一组，各开各的。 */
  sunkKey?: string
}

function PluginRows({ t, filter, query, rawQuery, dossiers, index, selection, expand, onSelect, toggle, userLayers }: WorkbenchListProps) {
  const openGroups = expand.groups

  const matches = (d: PluginDossier): boolean =>
    query === ''
    || labelOf(d).toLowerCase().includes(query)
    || d.name.toLowerCase().includes(query)
    || d.provides.some(s => s.service.toLowerCase().includes(query))
    || d.requires.some(s => s.service.toLowerCase().includes(query))

  const passes = (d: PluginDossier): boolean => {
    if (!matches(d)) return false
    switch (filter) {
      case 'attention': return isAttention(d, index)
      case 'overridden': return hasUserOverride(d)
      case 'disabled': return d.state === 'disabled'
      case 'runtime': return d.drift === 'extra'
      case 'foreign': return isForeign(vendorOf(d))
      case 'userdisabled': return disabledBy(d, userLayers) === 'user'
      case 'bundledisabled': return disabledBy(d, userLayers) === 'bundle'
      case 'runtimedisabled': return disabledBy(d, userLayers) === 'runtime'
      default: return true
    }
  }

  // 禁用的全树收成一处，跟容器展开与否无关。
  // 之前是每递归一层吐一个自己的禁用组：agent-presets 里一个、include 那层一个，
  // 后面还接着外层剩下的正常行——三段夹花，而且展开一个容器计数还会变。
  // 现在只在末尾出一组，条数和顶上「已禁用 N」那个 chip 对得上。
  // 收窄视野时容器一律展开：搜索和筛选的意思都是「把符合的全给我」，
  // 结果却被折叠状态挡掉一部分，数目还和顶上的 chip 对不上。
  const forceOpen = query !== '' || filter !== 'all'
  const isOpen = (key: string): boolean => openGroups.has(key) || forceOpen

  const rows: Row[] = []

  /**
   * 把这一层的禁用项收成一组，压在这一层的末尾。
   * **每层各收各的**——禁用的插件仍然属于它所在的那个容器，拍平到根层级会让
   * 「agent-presets 里关掉了哪些」这个问题无从回答。
   */
  const emitSunk = (list: PluginDossier[], depth: number, owner: string) => {
    if (list.length === 0) return
    const key = `${owner}::sunk`
    rows.push({ key, kind: 'sunk', depth, count: list.length, sunkKey: key })
    if (isOpen(key)) for (const n of list) rows.push({ key: n.id, kind: 'plugin', depth: depth + 1, d: n })
  }

  const walk = (nodes: PluginDossier[], depth: number, sunk: PluginDossier[]) => {
    for (const n of nodes) {
      if (n.group) {
        // include 是 cordis 的容器实现细节，不是你要看的实体——拍平。
        // 它的禁用项并进所在层级的那一组，不另起一组：既然它自己都不占一行，
        // 它的禁用组更不该夹在同层的正常行中间。
        if (n.shortId === 'include') { walk(n.children, depth, sunk); continue }
        const startAt = rows.length
        rows.push({ key: n.id, kind: 'realm', depth, d: n })
        if (isOpen(n.id)) {
          const inner: PluginDossier[] = []
          walk(n.children, depth + 1, inner)
          emitSunk(inner, depth + 1, n.id)
        }
        // 收窄视野时：容器自己命中就留下（它是可选中的实体，得找得到），
        // 否则只有当组里有命中的子行时才占位
        if (rows.length === startAt + 1 && forceOpen && !passes(n)) rows.pop()
        continue
      }
      // 只在「全部」下沉底。已经点了某个 chip 就说明视野已经收窄，再叠一层折叠
      // 等于两个机制同时藏东西——数出来还和 chip 上的数字对不上。
      if (n.state === 'disabled' && filter === 'all') {
        if (passes(n)) sunk.push(n)
        continue
      }
      if (passes(n)) rows.push({ key: n.id, kind: 'plugin', depth, d: n })
    }
  }

  const rootSunk: PluginDossier[] = []
  walk(dossiers, 0, rootSunk)
  emitSunk(rootSunk, 0, 'root')

  if (rows.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />

  const cols: Column[] = [
    { label: t('col.plugin'), width: 'minmax(0,1fr)' },
    { label: t('tool.pkg'), width: 'minmax(0,1fr)' },
    { label: t('col.mark'), width: '132px', align: 'right' },
    { label: t('col.action'), width: '104px', align: 'right' },
  ]
  return (
    <Table columns={cols}>
      {rows.map(row => {
        const indent = ROW_PAD + row.depth * INDENT_STEP
        if (row.kind === 'realm') {
          const realm = row.d!
          // 空 realm 不画折叠箭头——给一个点不开的箭头是在撒谎
          const expandable = realm.children.length > 0
          const open = expandable && isOpen(realm.id)
          const on = selection?.kind === 'plugin' && selection.id === realm.id
          return (
            <Row key={row.key} selected={on} indent={indent}
              // 已经选中再点一下就开合。可展开的行上「再点一次取消选中」几乎没用，
              // 而「看完档案想展开还得去够那个 12px 的箭头」很难受。
              onClick={() => {
                if (on && expandable) expand.toggleGroup(realm.id)
                else onSelect(on ? undefined : { kind: 'plugin', id: realm.id })
              }}>
              {/* 空容器不给箭头，槽位由 NameCell 默认占住，标题不会左移 */}
              <NameCell dim prefix={expandable
                ? <ChevronBox open={open} onClick={e => {
                    e.stopPropagation()   // 箭头只管开合，行本体才是选中
                    expand.toggleGroup(realm.id)
                  }} />
                : undefined}>
                <TruncText text={labelOf(realm)} query={rawQuery} mono />
              </NameCell>
              {/* 容器行也是插件行，第二列照样放包名——之前这里塞的是「realm」，
                  既破坏了列的契约，又借了 cordis 里另一个意思的词（那是服务隔离用的
                  符号命名空间，不是「装着子插件的容器」）。 */}
              <SubCell><TruncText text={realm.name} query={rawQuery} dim /></SubCell>
              <EndCell>{expandable ? t('plugins.holds', { count: realm.children.length }) : ''}</EndCell>
              {/* 容器也能关：关掉它里面的全都跟着没了，档案里那句话说的就是这个 */}
              <EndCell><ToggleCell t={t} d={realm} toggle={toggle} /></EndCell>
            </Row>
          )
        }
        if (row.kind === 'sunk') {
          const open = isOpen(row.sunkKey!)
          return (
            <GroupRow key={row.key} open={open} indent={indent} onToggle={() => expand.toggleGroup(row.sunkKey!)}>
              {t('plugins.disabledGroup', { count: row.count! })}
            </GroupRow>
          )
        }
        const d = row.d!
        const on = selection?.kind === 'plugin' && selection.id === d.id
        return (
          <Row key={row.key} selected={on} indent={indent}
            onClick={() => onSelect(on ? undefined : { kind: 'plugin', id: d.id })}>
            <NameCell dim={d.state === 'disabled'}>
              <TruncText text={labelOf(d)} query={rawQuery} mono />
            </NameCell>
            {/* 「包」这一列对孤儿设置行没有包名可放——写清它是什么，
                而不是留一格空白让人以为插件坏了 */}
            <SubCell>
              {d.settingsOnly === true
                ? <span className="text-caption">{t('plugins.settingsOnly')}</span>
                : <TruncText text={d.name} query={rawQuery} dim />}
            </SubCell>
            {/* 状态与出处并排：一条插件可以既被禁用又是三方，挑一个显示就是藏另一个 */}
            <Marks align="right"><RowMark t={t} d={d} index={index} userLayers={userLayers} /><VendorMark t={t} v={vendorOf(d)} /></Marks>
            <EndCell><ToggleCell t={t} d={d} toggle={toggle} /></EndCell>
          </Row>
        )
      })}
    </Table>
  )
}

/**
 * 出处标记。官方是常态，常态不出任何东西——这一条在每根轴上都一样，
 * 所以做成一个组件而不是在四处各写一遍。
 */
function VendorMark({ t, v }: { t: TranslateNS<'dsh-insight'>; v: Vendor | undefined }) {
  if (!isForeign(v)) return null
  return <span className="shrink-0 text-tertiary">{t(`vendor.${v!}`)}</span>
}

/**
 * 禁用 / 启用那一格。
 *
 * 要点两次才动手：这一下会写到你的 profile 补丁文件里，是这个面板唯一留在磁盘上的
 * 痕迹，误点一次比误点「打开洞察」贵得多。确认态标红，**2 秒不点、或者鼠标移开，
 * 都会退回去**——两条一起兜：定时器管「点完就不动了」，移开管「反悔了想马上撤」。
 *
 * **这一列不给颜色加过渡。** 这里踩过一个坑：文字是瞬间换的（「禁用」→「确认禁用？」），
 * 颜色却要慢慢淡 150 毫秒，于是中间那几帧是一个**黑色的「确认禁用？」**——蓝到红的
 * 插值正好经过一段发暗的中间色。一个正在问你「确定吗」的提示，不该先用别的颜色
 * 把这句话说一遍。所以这一列的每次跳色要么是即时的，要么就不该发生。
 *
 * 按不动的两种理由分开说：**撞名**是这一条永远不能这么写（换 id 也没用），
 * **版本错位**是重启一次就好。混成一句「不可用」等于什么都没说。
 */
function ToggleCell({ t, d, toggle }: { t: TranslateNS<'dsh-insight'>; d: PluginDossier; toggle: ToggleControl }) {
  const blocked = toggle.blockedBy(d)
  const off = d.state === 'disabled'
  const busy = toggle.busy === d.id
  const pending = toggle.pending === d.id
  const disabled = !toggle.supported || blocked !== undefined || toggle.busy !== undefined
  const label = busy
    ? t('toggle.working')
    : pending ? (off ? t('toggle.confirmOn') : t('toggle.confirmOff'))
      : off ? t('toggle.on') : t('toggle.off')
  const title = blocked === 'not-in-config' ? t('toggle.notInConfig')
    : blocked === 'twins' ? t('toggle.twins')
      : blocked === 'dup-in-config' ? t('toggle.dupInConfig')
        : !toggle.supported ? t('toggle.unsupported') : undefined
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // 这一格只管开关，行本体才是选中——不拦住冒泡会顺手把右栏也换掉
      onClick={e => { e.stopPropagation(); toggle.onToggle(d) }}
      onMouseLeave={() => { if (pending) toggle.onCancel() }}
      onBlur={() => { if (pending) toggle.onCancel() }}
      className={`shrink-0 rounded px-1.5 py-px text-[11.5px] ${
        disabled
          ? 'cursor-not-allowed text-dimmed'
          : pending ? 'cursor-pointer font-medium text-err' : 'cursor-pointer text-tertiary hover:text-brand-bright'
      }`}
    >
      {label}
    </button>
  )
}

/** 行尾标记：只标异常与人为改动，正常态什么都不出。 */
function RowMark({ t, d, index, userLayers }: { t: TranslateNS<'dsh-insight'>; d: PluginDossier; index: Index; userLayers: ReadonlySet<string> }) {
  if (isAttention(d, index)) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-warn">
        <i className="size-1.5 shrink-0 rounded-full bg-current" />
        {d.state === undefined || d.state === 'active' ? t('mark.missingProvider') : t(`state.${d.state}`)}
      </span>
    )
  }
  // 关着的行不只说「已禁用」，还说**是谁关的**：你自己关的一点就能撤，
  // 插件自带补丁层关的要在你的层写一行去盖，运行时关的改配置根本没用——
  // 三种情况能做的事完全不同，只写「已禁用」等于把这个问题留给你自己去翻
  const off = disabledBy(d, userLayers)
  if (off !== undefined) return <span className="shrink-0 text-tertiary">{t(`off.${off}`)}</span>
  // 已禁用是结构事实不是信号，所以纯文字、不带圆点（圆点留给「需要你处理」的那些）。
  // 排在「你改过」前面：一条被禁掉的插件，先要知道它没在跑。
  if (d.state === 'disabled') {
    return <span className="shrink-0 text-[11.5px] text-tertiary">{t('state.disabled')}</span>
  }
  if (hasUserOverride(d)) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-brand-bright">
        <i className="size-1.5 shrink-0 rounded-full bg-current" />
        {t('mark.overridden')}
      </span>
    )
  }
  if (d.drift === 'extra') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-brand-bright">
        <i className="size-1.5 shrink-0 rounded-full bg-current" />
        {t('mark.runtime')}
      </span>
    )
  }
  return null
}

/* ─────────────────────────── 按层 ─────────────────────────── */

function LayerRail({ t, query, layers, files, vendors, selection, onSelect }: WorkbenchListProps) {
  /**
   * 只有 bundle 层是 npm 包；profile / $DSH_HOME / overlay 是你自己的位置，不谈出处。
   *
   * 先问插件树：层的 patchPath 走的是软链（node_modules/dsh-insight/…），而插件
   * 自己的路径是 require.resolve 解析过的真路径——link 进来的包只有后者看得出是本地。
   * 那个包不是插件（纯配置 bundle）时才退回按路径判。
   */
  const layerVendor = (l: LayerView): Vendor | undefined =>
    l.kind === 'bundle' ? vendors.ofPackage(l.label) ?? vendorOf({ name: l.label, path: l.patchPath }) : undefined
  const shownLayers = layers
    .map((l, i) => [l, i] as const)
    .filter(([l]) => query === '' || l.label.toLowerCase().includes(query) || (l.patchPath ?? '').toLowerCase().includes(query) || l.hits.some(h => h.id.toLowerCase().includes(query)))
  const shownFiles = files
    .map((f, i) => [f, i] as const)
    .filter(([f]) => query === '' || f.path.toLowerCase().includes(query))

  if (shownLayers.length === 0 && shownFiles.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />

  const cols: Column[] = [
    { label: t('col.config'), width: 'minmax(0,1fr)' },
    { label: t('layers.file'), width: 'minmax(0,1fr)' },
    { label: t('col.mark'), width: '132px', hint: t('layers.orderNote') },
    { label: t('layers.acts'), width: '220px', align: 'right' },
  ]
  // 编号只说了顺序，没说方向——两头都标出来，「谁覆盖谁」才不用猜
  const first = shownLayers[0]?.[1] ?? -1
  const last = shownLayers.length > 0 ? shownLayers[shownLayers.length - 1]![1] : -1
  return (
    <Table columns={cols}>
      {shownLayers.map(([layer, i]) => {
        const on = selection?.kind === 'layer' && selection.index === i
        const counts = KIND_ORDER.map(k => [k, layer.hits.filter(h => h.kind === k).length] as const).filter(([, n]) => n > 0)
        return (
          <Row key={`${layer.label}-${i}`} selected={on}
            onClick={() => onSelect(on ? undefined : { kind: 'layer', index: i })}>
            <NameCell prefix={<span className="w-4 shrink-0 text-right text-[11.5px] text-tertiary tabular-nums">{i + 1}</span>}>
              {layer.label}
            </NameCell>
            <SubCell>{layer.patchPath === undefined ? '' : basename(layer.patchPath)}</SubCell>
            {/* 两头各标一个：最先那层谁都能覆盖它，最后那层谁也覆盖不了。
                纯文字、不带圆点——这一列里有色圆点是「需要你处理」的信号（见按插件的标记列），
                而「最先/最后/不参与合并」都只是结构事实，同一族就该长得一样。 */}
            <Marks>
              <span className="shrink-0">{i === last ? t('layers.lastWins') : i === first ? t('layers.firstApplied') : ''}</span>
              <VendorMark t={t} v={layerVendor(layer)} />
            </Marks>
            <EndCell>
              {counts.map(([k, n]) => (
                <span key={k} className={KIND_TONE[k] === 'dim' ? 'text-tertiary' : `${TONE_TEXT[KIND_TONE[k]]} font-medium`}>
                  {t(`event.${k}`)} {n}
                </span>
              ))}
            </EndCell>
          </Row>
        )
      })}
      {/* 不参与合并的普通配置文件：同样的行，只是没有序号、标题灰、右边注明。
          它们不改动任何 entry，所以没有「插入 / 覆盖 / 禁用」——列在这里是因为排查时要它们的路径。 */}
      {shownFiles.map(([file, i]) => {
        const on = selection?.kind === 'file' && selection.index === i
        return (
          <Row key={file.path} selected={on} onClick={() => onSelect(on ? undefined : { kind: 'file', index: i })}>
            <NameCell dim prefix={<span className="w-4 shrink-0 text-right text-[11.5px] text-caption">·</span>}>
              {basename(file.path)}
            </NameCell>
            <SubCell>{t(({ 'root-config': 'files.rootConfig', settings: 'files.settings', credentials: 'files.credentials', patch: 'files.patch' } as const)[file.role])}</SubCell>
            <span className="truncate text-[11.5px] text-tertiary">{t('layers.notMerged')}</span>
            <EndCell />
          </Row>
        )
      })}
    </Table>
  )
}

/* ─────────────────────────── 按服务 ─────────────────────────── */

function ServiceTable({ t, query, rawQuery, index, vendors, selection, onSelect }: WorkbenchListProps) {
  const rows = index.services.filter(s => query === '' || s.service.toLowerCase().includes(query))
  if (rows.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />
  const max = Math.max(...index.services.map(s => s.consumers.length), 1)
  const cols: Column[] = [
    { label: t('svc.service'), width: 'minmax(0,1fr)' },
    { label: t('svc.provider'), width: 'minmax(0,1fr)' },
    // 标记列在各轴上宽度一致，切轴时前两列才不会左右跳
    { label: t('col.mark'), width: '132px' },
    { label: t('svc.consumers'), width: '96px', align: 'right' },
  ]
  return (
    <Table columns={cols}>
      {rows.map(s => {
        const on = selection?.kind === 'service' && selection.service === s.service
        const n = s.consumers.length
        const hub = n >= 8
        return (
          <Row key={s.service} selected={on} onClick={() => onSelect(on ? undefined : { kind: 'service', service: s.service })}>
            <NameCell bold={hub} dim={n === 0}>
              <TruncText text={s.service} query={rawQuery} mono />
            </NameCell>
            <SubCell>{s.provider !== undefined ? shortOf(index, s.provider) : s.builtin ? t('svc.builtin') : t('svc.noProvider')}</SubCell>
            {/* 服务本身没有包，出处随提供它的那个插件；内置服务压根没有提供者 */}
            <Marks><VendorMark t={t} v={s.provider === undefined ? undefined : vendors.ofPlugin(s.provider)} /></Marks>
            <EndCell>
              <Meter value={n} max={max} heavy={hub} />
              {n === 0 ? t('svc.unused') : n}
            </EndCell>
          </Row>
        )
      })}
    </Table>
  )
}

/* ─────────────────────────── 按工具 ─────────────────────────── */

/**
 * 一行一个**工具插件**，不是一个工具——这个区别在表头写死，别让人误以为看到的是工具清单。
 * 真正的工具名要 agent 跑起来才存在（详见 shared/tools.ts 的头注释）。
 * 这一轴的价值是消歧：同名两份（宿主面禁用 / 预设 realm 启用）合成一行，直接给净结果。
 */
function ToolTable({ t, query, rawQuery, tools, inventory, vendors, selection, expand, onSelect }: WorkbenchListProps) {
  const showOff = expand.offTools
  const list = inventory?.tools ?? []
  // 有工具清单就按工具名列；没有（端点还没回来）退回插件粒度
  if (list.length === 0) return <ToolPluginTable t={t} query={query} rawQuery={rawQuery} tools={tools} selection={selection} onSelect={onSelect} />

  const rows = list.filter(x => query === '' || x.name.toLowerCase().includes(query)
    || (x.plugin ?? '').toLowerCase().includes(query) || (x.pkg ?? '').toLowerCase().includes(query))
  if (rows.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />

  // 第三列的量 = 关掉注册它的插件时会一起消失的工具数（含自己）。
  // 与「按服务」的「被依赖 N」同构：都是「这一条有多重的分量」，都配同款量条。
  const siblings = new Map<string, number>()
  for (const x of list) {
    const key = x.plugin ?? x.pkg ?? x.name
    siblings.set(key, (siblings.get(key) ?? 0) + 1)
  }
  const max = Math.max(...siblings.values(), 1)

  // 禁用的沉底收成一组，跟其他轴一致
  const live = rows.filter(x => x.enabled !== false)
  const off = rows.filter(x => x.enabled === false)
  const offOpen = showOff || query !== ''

  // 包名优先（准），拿不到就退回插件短 id；两条都查不到时按包名的 scope 兜底
  const toolVendor = (tool: (typeof rows)[number]): Vendor | undefined =>
    (tool.pkg === undefined ? undefined : vendors.ofPackage(tool.pkg))
    ?? vendors.ofShort(tool.plugin ?? '')
    ?? (tool.pkg === undefined ? undefined : vendorOf({ name: tool.pkg }))

  const row = (tool: (typeof rows)[number], indent?: number) => {
    const on = selection?.kind === 'toolName' && selection.name === tool.name && selection.pkg === tool.pkg
    const n = siblings.get(tool.plugin ?? tool.pkg ?? tool.name) ?? 1
    const heavy = n >= 4
    return (
      <Row key={`${tool.pkg ?? ''}/${tool.name}`} selected={on} indent={indent}
        onClick={() => onSelect(on ? undefined : { kind: 'toolName', name: tool.name, pkg: tool.pkg })}>
        <NameCell bold={heavy} dim={tool.enabled === false}>
          <TruncText text={tool.name} query={rawQuery} mono />
        </NameCell>
        <SubCell><TruncText text={tool.plugin ?? tool.pkg ?? ''} query={rawQuery} dim /></SubCell>
        {/* 来源必须透传：运行时观察是确凿的，源码扫描是推测。
            和「按插件」的标记列同一个位置、同一套写法——确凿的那些什么都不出。 */}
        <Marks>
          <span className="shrink-0">{tool.source === 'scan' ? t('tool.srcScan') : ''}</span>
          <VendorMark t={t} v={toolVendor(tool)} />
        </Marks>
        <EndCell><Meter value={n} max={max} heavy={heavy} />{n}</EndCell>
      </Row>
    )
  }

  const cols: Column[] = [
    { label: t('tool.name'), width: 'minmax(0,1fr)' },
    { label: t('tool.from'), width: 'minmax(0,1fr)' },
    { label: t('col.mark'), width: '132px' },
    { label: t('tool.siblings'), width: '96px', align: 'right' },
  ]
  return (
    <Table columns={cols}>
      {live.map(x => row(x))}
      {off.length > 0 && (
        <>
          <GroupRow open={offOpen} onToggle={expand.toggleOffTools}>
            {t('tool.disabledGroup', { count: off.length })}
          </GroupRow>
          {offOpen && off.map(x => row(x, ROW_PAD + INDENT_STEP))}
        </>
      )}
    </Table>
  )
}

/** 退化形态：拿不到工具清单时，仍按工具插件列（旧行为）。 */
function ToolPluginTable({ t, query, rawQuery, tools, selection, onSelect }: Pick<WorkbenchListProps, 't' | 'query' | 'rawQuery' | 'tools' | 'selection' | 'onSelect'>) {
  const rows = tools.filter(x => query === '' || x.id.toLowerCase().includes(query) || x.name.toLowerCase().includes(query))
  if (tools.length === 0) return <EmptyState title={t('tool.empty')} />
  if (rows.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />
  const cols: Column[] = [
    { label: t('tool.head'), width: 'minmax(0,1fr)' },
    { label: t('tool.pkg'), width: 'minmax(0,1fr)' },
    { label: t('tool.state'), width: '128px', align: 'right' },
  ]
  return (
    <Table columns={cols}>
      {rows.map(tool => {
        const on = selection?.kind === 'tool' && selection.id === tool.id
        return (
          <Row key={tool.id} selected={on} onClick={() => onSelect(on ? undefined : { kind: 'tool', id: tool.id })}>
            <NameCell dim={!tool.enabled}><TruncText text={tool.id} query={rawQuery} mono /></NameCell>
            <SubCell><TruncText text={tool.name} query={rawQuery} dim /></SubCell>
            <EndCell>
              {tool.split && <span className="text-brand-bright">{t('tool.split')}</span>}
              <span className={tool.enabled ? 'text-tertiary' : 'text-warn'}>{tool.enabled ? t('tool.enabled') : t('tool.disabled')}</span>
            </EndCell>
          </Row>
        )
      })}
    </Table>
  )
}

/** 完整 id → 短名（服务表与详情里的对端插件都用短名，长 id 无信息量）。 */
export function shortOf(index: Index, id: string): string {
  const sep = id.lastIndexOf(':')
  return sep < 0 ? id : id.slice(sep + 1)
}

/* ─────────────────────────── 按模型 ─────────────────────────── */

/**
 * 一行一个**模型**（provider + 模型 id）。和「按工具」同构，但底子干净得多：
 * 工具那边要旁听 register 再靠调用栈反推注册者，模型这边 provider 目录自带
 * settingsNs——「谁提供的」是上游正经答案，不是推测。所以这一轴没有「标记：源码推测」，
 * 标记位留给真正要提醒的事：现在默认在用的是哪个。
 *
 * 末尾折叠一组「可配未配的 provider」：上游声明了这些路由可以接，但你还没配。
 * 它们没有模型可列，所以不混进模型行里，收成一组。
 */
function ModelTable({ t, query, rawQuery, models, modelsStale, vendors, selection, expand, onSelect }: WorkbenchListProps) {
  if (models === undefined) {
    return modelsStale
      ? <EmptyState title={t('model.stale')} />
      : <PanelStatus kind="loading" text={t('status.loading')} />
  }
  const hit = (text: string): boolean => query === '' || text.toLowerCase().includes(query)
  const providerOf = new Map(models.providers.map(p => [p.id, p]))
  const perProvider = new Map<string, number>()
  for (const m of models.models) perProvider.set(m.provider, (perProvider.get(m.provider) ?? 0) + 1)
  const max = Math.max(...perProvider.values(), 1)
  const isDefault = (m: { provider: string; id: string }): boolean =>
    models.default?.provider === m.provider && models.default.model === m.id

  const shown = models.models.filter(m => hit(m.id) || hit(m.name) || hit(m.provider)
    || hit(providerOf.get(m.provider)?.settingsNs ?? ''))
  // 接线了却一个模型都没有的 provider：单独占一行，否则它会凭空消失
  const barren = models.providers.filter(p => p.wired && (perProvider.get(p.id) ?? 0) === 0
    && (hit(p.id) || hit(p.settingsNs ?? '')))
  const dormant = models.providers.filter(p => !p.wired && (hit(p.id) || hit(p.settingsNs ?? '')))
  const dormantOpen = expand.dormant || query !== ''

  if (shown.length === 0 && barren.length === 0 && dormant.length === 0) {
    return models.models.length === 0
      ? <EmptyState title={t('model.empty')} />
      : <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />
  }

  const cols: Column[] = [
    { label: t('col.model'), width: 'minmax(0,1fr)' },
    { label: t('model.from'), width: 'minmax(0,1fr)' },
    { label: t('col.mark'), width: '132px' },
    { label: t('model.siblings'), width: '96px', align: 'right' },
  ]
  const providerRow = (p: NonNullable<ModelInventory['providers']>[number], mark: string, indent?: number) => {
    const on = selection?.kind === 'provider' && selection.id === p.id
    return (
      <Row key={`provider/${p.id}`} selected={on} indent={indent}
        onClick={() => onSelect(on ? undefined : { kind: 'provider', id: p.id })}>
        <NameCell dim><TruncText text={p.id} query={rawQuery} mono /></NameCell>
        <SubCell><TruncText text={p.settingsNs ?? ''} query={rawQuery} dim /></SubCell>
        <Marks>
          <span className="shrink-0 text-tertiary">{mark}</span>
          <VendorMark t={t} v={vendors.ofShort(p.settingsNs ?? '')} />
        </Marks>
        <EndCell />
      </Row>
    )
  }
  return (
    <Table columns={cols}>
      {shown.map(m => {
        const on = selection?.kind === 'model' && selection.provider === m.provider && selection.id === m.id
        const n = perProvider.get(m.provider) ?? 1
        const current = isDefault(m)
        return (
          <Row key={`${m.provider}/${m.id}`} selected={on}
            onClick={() => onSelect(on ? undefined : { kind: 'model', provider: m.provider, id: m.id })}>
            <NameCell bold={current}><TruncText text={m.id} query={rawQuery} mono /></NameCell>
            <SubCell><TruncText text={m.provider} query={rawQuery} dim /></SubCell>
            {/* 圆点只给「现在实际在用的是它」；出处是背景信息，纯文字 */}
            <Marks>
              {current && (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-brand-bright">
                  <i className="size-1.5 shrink-0 rounded-full bg-current" />{t('model.default')}
                </span>
              )}
              <VendorMark t={t} v={vendors.ofShort(providerOf.get(m.provider)?.settingsNs ?? '')} />
            </Marks>
            {/* 量条不上重色：只有三条 provider，最大的那条占了 16 行，
                颜色落在多数行上就不再是信号。这一轴唯一该着色的是「默认」。 */}
            <EndCell><Meter value={n} max={max} />{n}</EndCell>
          </Row>
        )
      })}
      {barren.map(p => providerRow(p, t('model.noModels')))}
      {dormant.length > 0 && (
        <>
          <GroupRow open={dormantOpen} onToggle={expand.toggleDormant}>
            {t('model.dormantGroup', { count: dormant.length })}
          </GroupRow>
          {dormantOpen && dormant.map(p => providerRow(p, t('model.dormant'), ROW_PAD + INDENT_STEP))}
        </>
      )}
    </Table>
  )
}

/* ─────────────────────────── 按预设 ─────────────────────────── */

/**
 * 一行一个预设。
 *
 * 这一轴回答的是「会话开起来的时候，模型手里那套东西是从哪儿来的」。
 * 四列各管一件事：叫什么、谁给的、要不要提醒、装了多少插件。
 *
 * 标记位遵守同一条纪律——只标真正要提醒的：现在的默认、此刻在用、以及坏了的。
 * 出处（本地 / 三方）沿用其他轴的纯文字表达，因为它是背景信息不是警报。
 */
function PresetTable({ t, query, rawQuery, dossiers, presets, presetsStale, selection, onSelect, onJump }: WorkbenchListProps) {
  if (presets === undefined) {
    return presetsStale
      ? <EmptyState title={t('preset.stale')} detail={t('preset.staleWhy')} />
      : <PanelStatus kind="loading" text={t('status.loading')} />
  }
  // 空清单有两种截然不同的成因，混成一句「没有预设」是在把问题藏起来：
  // 服务压根不在（没装 / 被你关了），和服务在、扫过了、确实没有。
  // 前者要你去「按插件」把它打开，后者要你去写一个——能做的事完全不同。
  if (presets.service === 'missing') {
    // 只有真在插件树里找到那一条时才给跳转：指向不存在的行的链接比没有链接更糟。
    // 按包名找而不是按 id 猜——id 是部署自己起的，包名才是它的身份。
    const owner = [...walkDossiers(dossiers)].find(d => d.name.includes('dsh-agent-presets'))
    return (
      <EmptyState
        title={t('preset.noService')}
        detail={t('preset.noServiceWhy')}
        {...(owner === undefined ? {} : { action: (
          <button
            type="button"
            onClick={() => onJump({ kind: 'plugin', id: owner.id })}
            className="cursor-pointer border-0 border-b border-transparent bg-transparent p-0 text-[12.5px] text-brand-bright transition-colors duration-150 hover:border-current"
          >
            {t('preset.noServiceGoto', { id: owner.shortId })}
          </button>
        ) })}
      />
    )
  }
  if (presets.presets.length === 0) return <EmptyState title={t('preset.empty')} detail={t('preset.emptyWhy')} />
  const hit = (text: string): boolean => query === '' || text.toLowerCase().includes(query)
  const shown = presets.presets.filter(p =>
    hit(p.id) || hit(p.name ?? '') || hit(p.description ?? '') || hit(p.pkg ?? '') || hit(p.root))
  if (shown.length === 0) return <EmptyState title={t('status.noMatch')} detail={t('status.noMatchWhy')} />

  const max = Math.max(...presets.presets.map(p => p.plugins ?? 0), 1)
  const cols: Column[] = [
    { label: t('col.preset'), width: 'minmax(0,1fr)' },
    { label: t('preset.from'), width: 'minmax(0,1fr)' },
    { label: t('col.mark'), width: '156px' },
    { label: t('preset.plugins'), width: '96px', align: 'right' },
  ]
  return (
    <Table columns={cols}>
      {shown.map(p => {
        const on = selection?.kind === 'preset' && selection.id === p.id
        const n = p.plugins ?? 0
        // 包名答的是「谁给的」，比 root 目录名准；没有包名说明它不在任何包里 = 本地目录
        const from = p.pkg ?? basename(p.root)
        return (
          <Row key={p.id} selected={on}
            onClick={() => onSelect(on ? undefined : { kind: 'preset', id: p.id })}>
            <NameCell bold={p.isDefault}><TruncText text={p.name ?? p.id} query={rawQuery} /></NameCell>
            <SubCell><TruncText text={from} query={rawQuery} dim mono /></SubCell>
            <Marks>
              {p.broken !== undefined && (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-warn">
                  <i className="size-1.5 shrink-0 rounded-full bg-current" />{t('preset.brokenMark')}
                </span>
              )}
              {p.isDefault && (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-brand-bright">
                  <i className="size-1.5 shrink-0 rounded-full bg-current" />{t('preset.default')}
                </span>
              )}
              {p.sessions !== undefined && p.sessions > 0 && (
                <span className="shrink-0 text-secondary">{t('preset.inUse', { count: p.sessions })}</span>
              )}
              <VendorMark t={t} v={p.vendor} />
            </Marks>
            {/* 插件数上量条：五个预设之间「厚薄差多少」是这一轴最直观的一眼 */}
            <EndCell>{p.rows === undefined ? '—' : <><Meter value={n} max={max} />{n}</>}</EndCell>
          </Row>
        )
      })}
    </Table>
  )
}
