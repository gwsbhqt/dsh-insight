/**
 * Inspector 的宿主：把「按住修饰键指界面」和「洞察工作台」接起来。
 *
 * 这个组件注册在 `shell.overlay` 里，是**常驻**的——所以它必须在关着的时候
 * 几乎不存在：偏好里 enabled 为假时不装任何事件监听（见 useInspector），也不
 * 发一个 RPC。开启之后才拉一份插件树，用来判断归因到的包能不能落到插件轴上
 * （hover 的时候就得知道点了会不会白点）。
 *
 * 工作台开着时 inspector 自己让位：否则按住修饰键在工作台里点什么都会被截住，
 * 而工作台本身也是插件插进来的 UI，指着它归因只会得到「洞察自己」——自指没有
 * 信息量，还挡住了正经操作。
 */
import { useCallback, useMemo, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginNode } from '../../shared/types.ts'
import { buildVendorIndex, isForeign } from '../../shared/vendor.ts'
import { useInsightSources } from '../components/useInsightSources.ts'
import { useRpc } from '../components/useRpc.ts'
import { Workbench } from '../components/Workbench.tsx'
import type { Selection } from '../components/WorkbenchList.tsx'
import type { SlotFrame } from './attribute.ts'
import { InspectorOverlay } from './InspectorOverlay.tsx'
import { buildPkgIndex } from './pkgIndex.ts'
import { useInspectorPrefs } from './store.ts'
import { useInspector } from './useInspector.ts'

export interface InspectorHostProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
}

export function InspectorHost({ ctx, t }: InspectorHostProps) {
  const prefs = useInspectorPrefs()
  const [jumpTo, setJumpTo] = useState<Selection | undefined>()
  const [open, setOpen] = useState(false)

  // 开着 inspector 就常驻一份插件树：hover 时要判断「这个包在插件轴上有没有」。
  const tree = useRpc<PluginNode[]>(ctx, 'plugins/tree', prefs.enabled)
  const index = useMemo(() => buildPkgIndex(tree.data), [tree.data])
  const canJump = useCallback((pkg: string | undefined) => index.idOf(pkg) !== undefined, [index])

  /*
   * 「非官方」用的是 insight 自己那份判据（vendor.ts：磁盘路径不在 node_modules
   * 里 = 本地，@deepseek-ai scope = 官方，其余三方），不另写一套——判据有两份，
   * 迟早出现「同一个包在这里是官方、在那里是三方」。它要磁盘路径，所以只能建在
   * host 插件树上，也正因此插件树没到手时整屏标记先空着。
   */
  const vendors = useMemo(() => buildVendorIndex(tree.data ?? []), [tree.data])
  const isForeignPkg = useCallback((pkg: string) => isForeign(vendors.ofPackage(pkg)), [vendors])

  const onPick = useCallback((frame: SlotFrame) => {
    const id = index.idOf(frame.pkg)
    if (id === undefined) return
    setJumpTo({ kind: 'plugin', id })
    setOpen(true)
  }, [index])

  // 工作台开着时让位（见头注释）
  const active = useMemo(() => (open ? { ...prefs, enabled: false } : prefs), [open, prefs])
  const { armed, foreign, hit, menu, pickFrame } = useInspector({ prefs: active, onPick, isForeignPkg })

  // 工作台的九个源只在真开了之后才拉
  const sources = useInsightSources(ctx, open)

  return (
    <>
      <InspectorOverlay t={t} armed={armed} foreign={foreign} hit={hit} menu={menu} onPick={pickFrame} canJump={canJump} />
      {open && (
        <Workbench
          ctx={ctx}
          t={t}
          open={open}
          onClose={() => setOpen(false)}
          tree={sources.tree}
          graph={sources.graph}
          final={sources.final}
          settings={sources.settings}
          layers={sources.layers}
          files={sources.files}
          inventory={sources.inventory}
          models={sources.models}
          modelsStale={sources.modelsStale}
          presets={sources.presets}
          presetsStale={sources.presetsStale}
          loading={sources.loading}
          error={sources.error}
          onReload={sources.reload}
          initialJump={jumpTo}
        />
      )}
    </>
  )
}
