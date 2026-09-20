/**
 * Insight 工作台：一块屏幕，左边扫描，右边深入，上面给结论。
 *
 * 为什么是独立的全屏模态而不是设置页里的一块：设置弹窗写死 800×800，Insight 只拿到
 * 556px，主从布局在这个宽度里数学上不成立（最长包名 316px）。自绘全屏模态这条路
 * 是现成的——旧依赖图对话框就是这么开的（portal + Esc 捕获拦截 + 开关动画），
 * 宿主完全支持。工作台独立之后它盖住整个设置弹窗，不再受 800×800 约束。
 *
 * 三根排序轴是同一份数据的三种排列，不是三个数据源：
 *   按配置 = 同一份数据按配置层排，末尾接不参与合并的普通配置文件
 *   按插件 = 运行时骨架 × 配置意图 × 服务关系 × 设置，一行一档案
 *   按服务 = 插件之间真正的连接介质（60 个服务里 56 个恰好一个提供者，所以是表不是图）
 *   按工具 = agent 真正拿到手的工具名，运行时旁听 register 得来
 *   按模型 = agent 能选的模型，全部走 llm 服务的只读面（这一轴不需要任何 hack）
 * 排序是因果链：配置生出插件，插件提供服务，服务里跑出工具和模型。
 * 切轴不清空选中，右栏永远在原地：列表里点一行只换右栏，搜索词和筛选都不动。
 * 但右栏里的链接（服务 → 提供者、层 → 该层、工具 → 注册它的插件）是跨轴的，目标
 * 多半不在当前视野里——那一跳仍然要「切轴 + 展开 + 滚到中间 + 闪一下」，见 jump()。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { buildDossiers, walkDossiers, type PluginDossier } from '../../shared/dossier.ts'
import { buildGraphIndex } from '../../shared/graph.ts'
import { buildToolPlugins, countTools } from '../../shared/tools.ts'
import { buildVendorIndex, isForeign, vendorOf } from '../../shared/vendor.ts'
import type { ConfigFileInfo, FinalConfig, LayerView, ModelInventory, PluginGraphNode, PluginNode, PresetInventory, SettingsView, ToggleResult, ToolInventory } from '../../shared/types.ts'
import { CloseIcon } from './icons.tsx'
import { PanelStatus } from './PanelStatus.tsx'
import { RestartButton } from './RestartRow.tsx'
import { SURFACE_SIZE, surfaceMotion, useSettled } from './surface.ts'
import { normQuery } from './search.ts'
import { callInsight, InsightRpcError } from '../rpc.ts'
import { WorkbenchDetail } from './WorkbenchDetail.tsx'
import { WorkbenchList, type Expansion, type Selection, type ToggleControl } from './WorkbenchList.tsx'

export type Axis = 'layer' | 'plug' | 'svc' | 'tool' | 'model' | 'preset'

/** 过滤条件取代了旧的 tab：tab 换的是数据源，chip 收窄的是同一份数据。 */
export type FilterId = 'all' | 'attention' | 'disabled' | 'runtime' | 'foreign' | 'overridden' | 'userdisabled' | 'bundledisabled' | 'runtimedisabled'

export interface WorkbenchProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
  open: boolean
  onClose: () => void
  tree: PluginNode[] | undefined
  graph: PluginGraphNode[] | undefined
  final: FinalConfig | undefined
  settings: SettingsView[] | undefined
  layers: LayerView[] | undefined
  files: ConfigFileInfo[] | undefined
  inventory: ToolInventory | undefined
  models: ModelInventory | undefined
  /** host 还不认识 models/list（比前端旧）——这一轴空着，并说明原因。 */
  modelsStale?: boolean | undefined
  presets: PresetInventory | undefined
  /** host 还不认识 presets/list（比前端旧）——同上，空着并说明原因。 */
  presetsStale?: boolean | undefined
  loading: boolean
  error?: string | undefined
  onReload: () => void
  /**
   * 外部指定的落点：数据到齐后自动跳过去。inspector 点了界面上某块 UI 就走
   * 这条——它开的工作台不在设置页那棵树里，够不着这里的 jump()。
   */
  initialJump?: Selection | undefined
}

/**
 * 顺序即因果：配置生出插件，插件提供服务，服务里跑出工具和模型。
 * 「按预设」收在最后：前五根讲的是这个**进程**里已经跑着的东西，而预设是另一份
 * 配置——agent 面那份，会话开起来时才挂上去。它不在那条因果链上，所以不插进去打断它。
 */
const AXES: Axis[] = ['layer', 'plug', 'svc', 'tool', 'model', 'preset']

export function Workbench(props: WorkbenchProps) {
  const { t, open, onClose } = props
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  // 动画落定后卸掉 transform，否则它会劫持 tooltip 的 fixed 定位（见 surface.ts）
  const settled = useSettled(shown)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const id = setTimeout(() => setMounted(false), 200)
    return () => clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!mounted) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation() // 不透传给宿主设置对话框
      onClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [mounted, onClose])

  if (!mounted) return null
  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className={`dsh-insight fixed inset-0 z-[1010] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        role="dialog"
        aria-label={t('workbench.title')}
        onClick={e => e.stopPropagation()}
        style={SURFACE_SIZE}
        className={`relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-primary shadow-2xl transition-all duration-200 ease-out ${surfaceMotion(shown, settled)}`}
      >
        <WorkbenchBody {...props} />
      </div>
    </div>,
    document.body,
  )
}

function WorkbenchBody({ ctx, t, onClose, tree, graph, final, settings, layers, files, inventory, models, modelsStale, presets, presetsStale, loading, error, onReload, initialJump }: WorkbenchProps) {
  const [axis, setAxis] = useState<Axis>('plug')
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState<Selection | undefined>()
  // 展开状态住在这里而不是各轴内部：跳转要能把目标所在的分组打开
  const [openGroups, setOpenGroups] = useState<ReadonlySet<string>>(new Set())
  const [showOffTools, setShowOffTools] = useState(false)
  const [showDormant, setShowDormant] = useState(false)
  /** 跳转序号：每跳一次自增，驱动「滚到中间 + 闪一下」。用计数而不是 selection，
      因为可能连着跳到同一行（点两次同一个链接），那时 selection 没变但仍要再闪。 */
  const [reveal, setReveal] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  /** 禁用/启用：确认态、写盘中、以及写完那一条横幅。都只允许同时存在一份。 */
  const [pendingToggle, setPendingToggle] = useState<string | undefined>()
  const [busyToggle, setBusyToggle] = useState<string | undefined>()
  const [notice, setNotice] = useState<{ tone: 'ok' | 'err'; text: string } | undefined>()

  /**
   * 写盘提示自己退场。它报的是一件已经做完的事，读一眼就没用了——
   * 留在那儿只会变成需要你动手关掉的垃圾。失败那条留久一点：那是要照着排查的。
   */
  useEffect(() => {
    if (notice === undefined) return
    const timer = setTimeout(() => setNotice(undefined), notice.tone === 'err' ? 12000 : 6000)
    return () => clearTimeout(timer)
  }, [notice])

  // 确认态 2 秒不点就自己退回去：误点的人什么都不用做，等一下按钮就复原了
  useEffect(() => {
    if (pendingToggle === undefined) return
    const timer = setTimeout(() => setPendingToggle(undefined), 2000)
    return () => clearTimeout(timer)
  }, [pendingToggle])

  const dossiers = useMemo(
    () => tree === undefined || graph === undefined || final === undefined
      ? []
      : buildDossiers(tree, graph, final, settings ?? []),
    [tree, graph, final, settings],
  )
  const index = useMemo(() => buildGraphIndex(graph ?? []), [graph])
  const tools = useMemo(() => buildToolPlugins(dossiers), [dossiers])
  // 出处只按一份规则算一次，五根轴共用——各轴各拼一遍必然拼出「同一个包在这张表
  // 是官方、在那张表是三方」
  const vendors = useMemo(() => buildVendorIndex(dossiers), [dossiers])
  const byId = useMemo(() => {
    const map = new Map<string, PluginDossier>()
    for (const d of walkDossiers(dossiers)) map.set(d.id, d)
    return map
  }, [dossiers])
  /** 子 id → 父 id，跳转时用来算「要展开哪几层」。 */
  const parentOf = useMemo(() => {
    const map = new Map<string, string>()
    const walk = (nodes: PluginDossier[], parent?: string) => {
      for (const n of nodes) {
        if (parent !== undefined) map.set(n.id, parent)
        if (n.children.length > 0) walk(n.children, n.id)
      }
    }
    walk(dossiers)
    return map
  }, [dossiers])

  /**
   * 一条 entry 的禁用组落在哪一层：往上找最近的、会渲染成一行的容器。
   * include 被拍平（它自己不占行），所以要跳过去继续往上。
   */
  const sunkKeyFor = (id: string): string => {
    let at = parentOf.get(id)
    while (at !== undefined && byId.get(at)?.shortId === 'include') at = parentOf.get(at)
    return `${at ?? 'root'}::sunk`
  }

  /** 手里已经有一份能画的数据了——决定刷新时要不要让占位符接管整块。 */
  const hasData = dossiers.length > 0

  const expand: Expansion = {
    groups: openGroups,
    toggleGroup: id => setOpenGroups(prev => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    }),
    offTools: showOffTools,
    toggleOffTools: () => setShowOffTools(v => !v),
    dormant: showDormant,
    toggleDormant: () => setShowDormant(v => !v),
  }

  /** 属于「你」的那些层：profile 补丁层与 $DSH_HOME 层。标签从 kind 现算，不写死字符串。 */
  const userLayers = useMemo(
    () => new Set((layers ?? []).filter(l => l.kind === 'profile' || l.kind === 'home').map(l => l.label)),
    [layers],
  )

  /**
   * 这一行为什么按不动。判据分两层，因为补丁作用的对象和你眼前看到的树不是一回事：
   *
   *   **配置里有几条**——补丁按 id 命中的是**重放出来的那份配置**（宿主面）。
   *   0 条 = 手写也没用（运行时注册的插件、只存在于预设里的行都是这样）；
   *   ≥2 条 = 配置本身有重名，写下去会同时命中。
   *
   *   **运行时有几份**——配置里唯一、运行时却有两份，是会话把预设挂上来了
   *   （include:tool-bash 与 include:agent-presets:tool-bash）。这时补丁仍然有效
   *   （它命中配置那一条），只是面板分不清你点的是哪一行，所以不替你决定。
   *   注意这一份是**随会话来去的**：关掉对话它就只剩一份，按钮又能点了。
   */
  const configCount = useMemo(() => {
    const seen = new Map<string, number>()
    for (const e of final?.entries ?? []) seen.set(e.id, (seen.get(e.id) ?? 0) + 1)
    return seen
  }, [final])

  const runtimeCount = useMemo(() => {
    const seen = new Map<string, number>()
    for (const d of walkDossiers(dossiers)) seen.set(d.shortId, (seen.get(d.shortId) ?? 0) + 1)
    return seen
  }, [dossiers])

  const blockedBy = (d: PluginDossier): 'not-in-config' | 'twins' | 'dup-in-config' | undefined => {
    const inConfig = configCount.get(d.shortId) ?? 0
    if (inConfig === 0) return 'not-in-config'
    if (inConfig > 1) return 'dup-in-config'
    // 配置里唯一但运行时有两份：这一行自己带着来源层，说明它就是配置里那一条，可以点
    if ((runtimeCount.get(d.shortId) ?? 1) > 1 && d.origin === undefined) return 'twins'
    return undefined
  }

  /** 写一次开关：第一下进确认态，第二下才真写。写完重新拉数据，让面板显示实况而不是我们的期望。 */
  const runToggle = (d: PluginDossier) => {
    if (busyToggle !== undefined) return
    if (pendingToggle !== d.id) {
      setNotice(undefined)
      setPendingToggle(d.id)
      return
    }
    setPendingToggle(undefined)
    setBusyToggle(d.id)
    const next = toggleTarget(d)
    const stateText = next ? t('toggle.stateOff') : t('toggle.stateOn')
    callInsight<ToggleResult>(ctx, 'config/toggle', { id: d.shortId, disabled: next })
      .then(result => {
        if (!result.ok) {
          setNotice({ tone: 'err', text: t('toggle.fail', { message: result.message }) })
          return
        }
        const key = ({ inserted: 'toggle.doneInserted', updated: 'toggle.doneUpdated', removed: 'toggle.doneRemoved', unchanged: 'toggle.doneUnchanged' } as const)[result.action]
        setNotice({ tone: 'ok', text: t(key, { id: d.shortId, state: stateText, path: result.path }) })
        // 补丁层是热加载的，但生效与否得由数据说了算，不由我们宣布
        if (result.action !== 'unchanged') onReload()
      })
      .catch((cause: unknown) => {
        // host 比前端旧时端点不存在，而旧 host 的错误信封解不出来——所以不认错误码，
        // 只按「拿到了 InsightRpcError 说明 host 还活着」分岔
        const message = cause instanceof InsightRpcError ? cause.message : t('toggle.unsupported')
        setNotice({ tone: 'err', text: t('toggle.fail', { message }) })
      })
      .finally(() => setBusyToggle(undefined))
  }

  const toggle: ToggleControl = {
    // 端点存不存在只有调过才知道，所以先当它有；调不通时横幅会说清是版本错位
    supported: true,
    ...(pendingToggle === undefined ? {} : { pending: pendingToggle }),
    ...(busyToggle === undefined ? {} : { busy: busyToggle }),
    blockedBy,
    onToggle: runToggle,
    onCancel: () => setPendingToggle(undefined),
  }

  /** 列表里点一行：只换右栏，搜索词与筛选保持不动——它们是你刚设的，凭什么替你清掉。 */
  const select = (next: Selection | undefined) => setSelection(next)

  /**
   * 从右栏链接跳到别处（服务名 → 提供者、层名 → 该层、工具 → 注册它的插件）。
   * 目标多半不在当前视野里，所以这一跳要把挡路的东西全部让开：
   *   切到目标所在的轴 → 清掉搜索与筛选（否则跳过去是一片空白）
   *   → 展开目标的祖先链、并把别的分组折回去（免得展开一堆无关的东西）
   *   → 滚到可视区中间 → 闪一下再平静（见下面的 effect）
   */
  const jump = (next: Selection) => {
    setQuery('')
    switch (next.kind) {
      case 'plugin': {
        setAxis('plug')
        setFilter('all')
        // 只展开到目标那一条为止，其余全折起来
        const chain = new Set<string>()
        for (let at = parentOf.get(next.id); at !== undefined; at = parentOf.get(at)) chain.add(at)
        // 目标自己被沉底（运行时禁用）时，还得打开它所在那一层的禁用组——
        // 每层各有一组，所以要先算出是哪一组，否则它不在 DOM 里
        if (byId.get(next.id)?.state === 'disabled') chain.add(sunkKeyFor(next.id))
        setOpenGroups(chain)
        break
      }
      case 'layer':
      case 'file':
        setAxis('layer')
        break
      case 'service':
        setAxis('svc')
        break
      case 'preset':
        setAxis('preset')
        break
      case 'tool':
        setAxis('tool')
        break
      case 'toolName': {
        setAxis('tool')
        const hit = inventory?.tools.find(x => x.name === next.name && x.pkg === next.pkg)
        setShowOffTools(hit?.enabled === false)
        break
      }
      case 'model':
        setAxis('model')
        break
      case 'provider': {
        setAxis('model')
        // 未接线的 provider 收在折叠组里，不打开就没有那一行
        setShowDormant(models?.providers.find(p => p.id === next.id)?.wired === false)
        break
      }
    }
    setSelection(next)
    setReveal(n => n + 1)
  }

  /**
   * 外部落点只跳一次：跳完使用者多半要自己切轴、换选中，不能每次重渲染都被
   * 拽回去。要等 tree 到齐——jump 靠它算祖先链，空着跳过去是一片没展开的树。
   * initialJump 换了新值（又点了一块别的 UI）才允许再跳。
   */
  const consumedJump = useRef<Selection | undefined>(undefined)
  useEffect(() => {
    if (initialJump === undefined || tree === undefined) return
    if (consumedJump.current === initialJump) return
    consumedJump.current = initialJump
    jump(initialJump)
  }, [initialJump, tree])

  /**
   * 跳转落地：把目标行滚到可视区中间并闪一下。
   * 只对跳转做，不对列表点选做——你刚点的那一行本来就在眼皮底下，替你滚一下是添乱。
   *
   * 要等两帧再滚：展开祖先链和「滚过末行」的留白都要先落到布局上。抢在那之前滚，
   * 可滚范围还没长出来，目标行会停在离中线两百多像素的地方。
   * 滚的是实测差值而不是 scrollIntoView({block:'center'})——后者算的是「最近的
   * 可滚祖先」，这里的滚动容器没有定位上下文，落点不可控。
   *
   * 瞬时定位而不是平滑滚动：跨百来行时 Chrome 的平滑滚动要跑一秒半，闪烁都放完了
   * 目标行还没到，中间那段飞驰的列表也读不出任何东西。直接落位、再闪一下交代
   * 「你被带到这儿了」，反而比动画好读。
   */
  useEffect(() => {
    if (reveal === 0) return undefined
    let flashed: HTMLElement | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        const scroller = listRef.current
        const node = scroller?.querySelector<HTMLElement>('[data-selected="true"]')
        if (scroller === null || node === null || node === undefined) return
        const box = scroller.getBoundingClientRect()
        const row = node.getBoundingClientRect()
        const delta = (row.top + row.height / 2) - (box.top + box.height / 2)
        scroller.scrollTo({ top: scroller.scrollTop + delta })
        node.classList.remove('dsh-row-flash')
        void node.offsetWidth // 强制回流，否则连跳同一行时动画不会重播
        node.classList.add('dsh-row-flash')
        flashed = node
        timer = setTimeout(() => node.classList.remove('dsh-row-flash'), 1200)
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
      if (timer !== undefined) clearTimeout(timer)
      flashed?.classList.remove('dsh-row-flash')
    }
  }, [reveal])

  const q = normQuery(query)
  return (
    <>
      {/* 顶栏：只放身份与全局动作 */}
      <div className="flex h-[55px] shrink-0 items-center gap-3 border-b border-line px-4">
        <span className="text-[14px] font-medium">{t('workbench.title')}</span>
        {/* 改开关的地方在工作台，「改完要重启才生效」的那颗按钮就得够得着：
            摘要卡上那颗被这一层盖住了，说「上面那颗」等于说了一句没法照做的话 */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <RestartButton ctx={ctx} t={t} />
        </div>
        <button
          type="button"
          onClick={onReload}
          className="shrink-0 cursor-pointer rounded px-2.5 py-1 text-[12.5px] text-secondary transition-colors duration-150 hover:bg-hover hover:text-primary"
        >
          {t('action.refresh')}
        </button>
        <button
          type="button"
          aria-label={t('action.close')}
          onClick={onClose}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-tertiary transition-colors duration-150 hover:bg-hover hover:text-primary"
        >
          <CloseIcon />
        </button>
      </div>

      {/* 结论条：打开就先说结果，再让你翻 */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-[18px] py-[13px] leading-[26px]">
        <Verdict t={t} dossiers={dossiers} index={index} layers={layers} tools={tools} inventory={inventory} models={models} presets={presets} />
      </div>

      {/* 工具栏：搜索 + 排序轴 + 过滤条件 */}
      <div className="flex min-h-[56px] shrink-0 flex-wrap items-center gap-2.5 border-b border-line px-[18px] py-[11px]">
        <span className="relative inline-flex items-center">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.placeholder')}
            className="box-border w-[220px] rounded-[7px] border border-line bg-surface py-[5px] pr-[26px] pl-2.5 text-[12.5px] text-primary outline-none transition-colors duration-150 placeholder:text-tertiary focus:border-line-2"
          />
          {query !== '' && (
            <button
              type="button"
              aria-label={t('search.clear')}
              onClick={() => setQuery('')}
              className="absolute right-1.5 cursor-pointer p-0.5 text-[12px] leading-none text-tertiary transition-colors duration-150 hover:text-primary"
            >
              ✕
            </button>
          )}
        </span>

        <span className="inline-flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
          {AXES.map(id => (
            <button
              key={id}
              type="button"
              aria-pressed={axis === id}
              onClick={() => setAxis(id)}
              className={`cursor-pointer rounded-md px-[13px] py-1 text-[12.5px] font-medium transition-colors duration-150 ${axis === id ? 'bg-surface text-primary shadow-sm' : 'text-tertiary hover:text-primary'}`}
            >
              {t(`axis.${id}`)}
            </button>
          ))}
        </span>

        {axis === 'plug' && (
          <Chips t={t} dossiers={dossiers} index={index} filter={filter} onPick={setFilter} userLayers={userLayers} />
        )}
      </div>

      {/* 主从：左边扫描，右边深入。右栏固定在原地，不再用浮层盖住来源行。
          右栏占三分之一而不是写死 420px——写死的话屏幕越宽它的占比越小，
          长路径与 JSON 越挤，而左边的列表反而空出一大片。 */}
      {/* 只有**还没有数据**时才让占位符接管整块。
          重新拉数据（比如点完禁用之后）时列表照常留在原地，新数据到了就地替换——
          否则每写一次配置，整个面板会先塌成一行「加载中」再长回来，看着就是抖一下。 */}
      {error !== undefined && !hasData ? (
        <PanelStatus kind="error" text={t('status.error', { message: error })} />
      ) : loading && !hasData ? (
        <PanelStatus kind="loading" text={t('status.loading')} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
          <div ref={listRef} className="min-h-0 overflow-y-auto overscroll-contain border-r border-line">
            <WorkbenchList
              t={t}
              axis={axis}
              filter={filter}
              query={q}
              rawQuery={query}
              dossiers={dossiers}
              index={index}
              layers={layers ?? []}
              files={files ?? []}
              tools={tools}
              inventory={inventory}
              models={models}
              modelsStale={modelsStale === true}
              presets={presets}
              presetsStale={presetsStale === true}
              vendors={vendors}
              toggle={toggle}
              userLayers={userLayers}
              selection={selection}
              expand={expand}
              onSelect={select}
              onJump={jump}
            />
          </div>
          <aside className="min-h-0 overflow-y-auto overscroll-contain p-[18px]">
            <WorkbenchDetail
              ctx={ctx}
              t={t}
              selection={selection}
              query={query}
              byId={byId}
              index={index}
              layers={layers ?? []}
              files={files ?? []}
              tools={tools}
              inventory={inventory}
              models={models}
              presets={presets}
              userLayers={userLayers}
              onSelect={jump}
            />
          </aside>
        </div>
      )}

      {/* 写盘之后说一句：改了哪个文件、做了什么。这是面板唯一留在磁盘上的痕迹，不该悄悄发生。
          **浮在右下角而不是插进文档流**——插进去会把工具栏和整张列表往下顶一截，
          而这条消息恰好在你刚点完按钮时出现，那一下顶动看起来就是面板在抖。 */}
      {notice !== undefined && (
        <div className={`absolute right-4 bottom-4 z-10 flex max-w-[min(560px,70%)] items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[12px] leading-[1.55] shadow-lg ${notice.tone === 'err' ? 'text-err' : 'text-secondary'}`}>
          <span className="min-w-0 break-all">
            {notice.text}
            {notice.tone === 'ok' && <span className="text-tertiary"> {t('toggle.restartHint')}</span>}
          </span>
          <button
            type="button"
            onClick={() => setNotice(undefined)}
            className="shrink-0 cursor-pointer text-[11.5px] text-tertiary transition-colors duration-150 hover:text-primary"
          >
            {t('toggle.dismiss')}
          </button>
        </div>
      )}
    </>
  )
}

/** 顶栏结论条：先说结果，再给你翻。 */
function Verdict({ t, dossiers, index, layers, tools, inventory, models, presets }: {
  t: TranslateNS<'dsh-insight'>
  dossiers: PluginDossier[]
  index: ReturnType<typeof buildGraphIndex>
  layers: LayerView[] | undefined
  tools: ReturnType<typeof buildToolPlugins>
  inventory: ToolInventory | undefined
  models: ModelInventory | undefined
  presets: PresetInventory | undefined
}) {
  const all = [...walkDossiers(dossiers)].filter(d => !d.group)
  const attention = all.filter(d => isAttention(d, index)).length
  const t2 = countTools(tools)
  const items: [string, number, string][] = [
    ['', all.length, t('summary.plugins')],
    ['', all.filter(d => d.state === 'active').length, t('summary.active')],
    ['', all.filter(d => d.state === 'disabled').length, t('summary.disabled')],
    [attention > 0 ? 'text-warn' : '', attention, t('summary.attention')],
    ['text-brand-bright', all.filter(hasUserOverride).length, t('summary.overrides')],
    ['', layers?.length ?? 0, t('summary.layers')],
    ['', inventory?.tools.length ?? t2.enabled, inventory === undefined ? t('summary.toolsEnabled') : t('summary.tools')],
    ...(models === undefined ? [] : [['', models.models.length, t('summary.models')] as [string, number, string]]),
    // 数不出来就不出这一格：0 会被读成「一个预设都没有」，那是另一回事
    ...(presets === undefined ? [] : [['', presets.presets.length, t('summary.presets')] as [string, number, string]]),
  ]
  return (
    <>
      {items.map(([tone, value, label], i) => (
        <span key={i} className="inline-flex items-baseline gap-1.5 text-[13px] text-tertiary">
          <b className={`text-[15px] font-semibold tabular-nums ${tone === '' ? 'text-primary' : tone}`}>{value}</b>
          {label}
        </span>
      ))}
    </>
  )
}

export function hasUserOverride(d: PluginDossier): boolean {
  return d.settings?.user !== undefined
}

/**
 * 这条插件是**谁**关的。分三档，因为你能做的事完全不同：
 *   user    —— 你自己那两层关的，点一下「启用」就能撤；
 *   bundle  —— 某个插件自带的补丁层关的，撤它要在你的层写一行 disabled: false；
 *   runtime —— 配置层里没人关它，是运行时才关的（`!!js` 表达式，或者容器被关了），
 *              这种改配置没用，得去看那个表达式或那个容器。
 * @returns 关它的那一档；这条根本没关就是 undefined。
 */
export function disabledBy(d: PluginDossier, userLayers: ReadonlySet<string>): 'user' | 'bundle' | 'runtime' | undefined {
  if (d.state !== 'disabled' && !d.disabled) return undefined
  const events = d.intent?.events ?? []
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i]
    if (e === undefined || (e.kind !== 'disable' && e.kind !== 'enable')) continue
    // 最后一次动作是「打开」，那它现在关着就不是配置层干的
    if (e.kind === 'enable') return 'runtime'
    return userLayers.has(e.layer) ? 'user' : 'bundle'
  }
  return 'runtime'
}

/**
 * 配置层已经改了，但这个进程还在按旧配置跑。
 *
 * 补丁层是热加载的，可这一条落没落到运行时由 dsh 说了算。差在这一步的时候，界面既不能
 * 说「已经关了」（它还在跑），也不能什么都不说——那就成了「点了一下没反应」。
 * 判据直接用 host 那份对账（`drift === 'mismatch'`）：`!!js` 表达式与撞名短 id 本来就
 * 被排除在它之外，这里跟着它走，不另立一套判断。
 */
export function pendingRestart(d: PluginDossier): boolean {
  return d.drift === 'mismatch' && d.intent !== undefined
}

/**
 * 这一行此刻**算不算关着**——开关按钮给出哪个动作由它决定。
 *
 * 配置与运行时打架时跟**配置**走：你刚点下的那一笔立刻反映在按钮上（再点一下就是撤回），
 * 而不是让按钮停在原地、让人以为没写进去。至于它生效没有，由行尾的「待重启」去说——
 * 生效与否仍然由数据说了算，不由按钮宣布。
 */
export function configuredOff(d: PluginDossier): boolean {
  return pendingRestart(d) ? d.intent?.disabled === true : d.state === 'disabled'
}

/**
 * 点这一下要写下去的目标状态。
 *
 * 必须和按钮上的字同源：写成 `d.state !== 'disabled'` 而按钮按 {@link configuredOff}
 * 画，两者在「配置已改、运行时没跟上」的行上会指向相反的方向——按钮写着「禁用」，
 * 点下去请求的却是「启用」，于是什么都没发生。**点了没反应比点错还难查。**
 */
export function toggleTarget(d: PluginDossier): boolean {
  return !configuredOff(d)
}

/** 需要人处理：加载失败 / 卡在等待 / 依赖无人提供（内置不算）。 */
export function isAttention(d: PluginDossier, index: ReturnType<typeof buildGraphIndex>): boolean {
  if (d.state === 'failed' || d.state === 'pending' || d.state === 'loading' || d.state === 'unknown') return true
  // host 不具备内置服务识别能力时不报「缺提供者」——见 missingProviders 的注释
  if (!index.knowsBuiltin) return false
  return d.requires.some(r => r.providers.length === 0 && index.serviceOf.get(r.service)?.builtin !== true)
}

function Chips({ t, dossiers, index, filter, onPick, userLayers }: {
  t: TranslateNS<'dsh-insight'>
  dossiers: PluginDossier[]
  index: ReturnType<typeof buildGraphIndex>
  filter: FilterId
  onPick: (id: FilterId) => void
  userLayers: ReadonlySet<string>
}) {
  const everyone = [...walkDossiers(dossiers)]
  const all = everyone.filter(d => !d.group)
  const counts: Record<FilterId, number> = {
    all: all.length,
    attention: all.filter(d => isAttention(d, index)).length,
    overridden: all.filter(hasUserOverride).length,
    disabled: all.filter(d => d.state === 'disabled').length,
    runtime: all.filter(d => d.drift === 'extra').length,
    foreign: all.filter(d => isForeign(vendorOf(d))).length,
    // 关掉来源这三格把容器也数进去：关掉一个容器是你能做的最重的一件事
    // （里面的全跟着没），它必须出现在对应那一格里，否则 chip 上的数目
    // 会比列表里看到的行数少——这一排的规矩是数目要对得上
    userdisabled: everyone.filter(d => disabledBy(d, userLayers) === 'user').length,
    bundledisabled: everyone.filter(d => disabledBy(d, userLayers) === 'bundle').length,
    runtimedisabled: everyone.filter(d => disabledBy(d, userLayers) === 'runtime').length,
  }
  // 「已禁用」后面紧跟着把它拆开的那三格：它们正好把「已禁用」分成不相交的三份，
  // 挨着放才看得出是同一个数在拆。「你改过」和「你禁用」收在最后——前面几个说的是
  // 这套配置本来是什么样，这两个说的是**你**在上面动过什么。
  // 人称也跟着统一：这个面板通篇对你说话，不该有一格突然改口说「我」
  const ids: FilterId[] = [
    'all', 'attention', 'runtime', 'foreign',
    'disabled', 'bundledisabled', 'runtimedisabled',
    'overridden', 'userdisabled',
  ]
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map(id => {
        // 数目为 0 的 chip 不出：一个点了也没结果的按钮只是噪音。
        // 「全部」永远在（它是复位键），正在生效的那个也留着——否则点完它自己就消失了
        if (counts[id] === 0 && id !== 'all' && filter !== id) return null
        const on = filter === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(id)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[12.5px] transition-colors duration-150 ${on ? 'border-brand bg-brand text-surface' : 'border-line text-secondary hover:bg-hover'}`}
          >
            {t(`filter.${id}`)}
            <span className={`tabular-nums ${on ? 'opacity-60' : 'text-tertiary'}`}>{counts[id]}</span>
          </button>
        )
      })}
    </span>
  )
}
