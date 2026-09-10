/**
 * Inspector 的浮层：高亮 + 提示条 + 「当前 → 根」层级菜单。
 *
 * 注册进 `shell.overlay`（list slot，root scope）——ui-layout 的注释里明说
 * 「要浮在整个 app 之上就注册这里，它是 additive 的，且在你自己开启
 * pointer-events 之前对点击透明」。
 *
 * 但画面必须 **portal 到 body**：`shell.overlay` 的锚点在 AppFrame 里面，而设置
 * 对话框是 portal 到 body 的——跨 stacking context 时 z-index 不参与比较，于是
 * 设置面板打开后高亮框和提示牌会被整块盖住，只从面板边缘露出一点，看着就像
 * 「在查面板背后的东西」（归因其实是对的，只是看不见）。portal 到 body 之后
 * 我们是 body 的最后一个孩子，才真的浮在所有东西之上。工作台也是这么做的。
 *
 * 指针接管是按需的：没按修饰键时 `pointer-events: none`，页面完全照常用；
 * 按住的那几秒（或菜单开着时）改成 auto 铺满视口，页面收不到任何鼠标事件——
 * 这样连宿主的 tooltip 和 CSS `:hover` 一起挡掉（理由见 useInspector 的头注释）。
 * 十字准星也因此设在浮层自己身上，不必去改 document.body 的行内样式。
 *
 * 视觉分三层：
 *   非官方（琥珀框）按住的那一刻整屏扫一遍，把三方与本地插件插进来的界面全标出来。
 *   地盘（蓝虚线框）鼠标所指那条 entry 的整块范围——看得出这个插件占多大。
 *   命中（蓝实线框）鼠标正指的那个元素。
 * 菜单开着时地盘框改成跟着菜单项走：滑到哪一层，背后就框出那一层管的地方。
 *
 * 两种颜色都来自房子的 token，不新引色板：选取用 brand-bright（蓝），非官方用
 * warn（琥珀）。这两件事必须一眼分得开——一个是「你正指着这个」，另一个是
 * 「这一屏里这些不是 dsh 自带的」，混成同色就白标了。
 *
 * 定位一律用 `left: 0` + `translate()` 里的 clamp：`100%` 在 transform 的
 * 百分比里指**自身宽度**，于是「贴着目标、又不越出视口」纯 CSS 就能夹住，
 * 不用先量一遍宽度（量就要多渲染一帧，牌子会闪一下）。
 */
import { useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { SlotFrame } from './attribute.ts'
import { INSPECTOR_ATTR, INSPECTOR_UI_ATTR, type Box, type ForeignMark, type InspectorHit, type InspectorMenu, type MenuLevel } from './useInspector.ts'

/** 视口边距：牌子与菜单都不贴边。 */
const GUTTER = 8

/**
 * 两种「范围框」的**唯一**形状：2px 虚线 + 同一个圆角，谁都不许自己改。
 *
 * 地盘框（蓝）和非官方框（琥珀）说的是同一类事——「这一块地方归谁」，只有归谁
 * 不同。所以形状必须一模一样、差别只在颜色：一旦线宽或线型也跟着变，读的人会
 * 以为那是两种不同性质的东西。
 *
 * 线宽跟命中框（实线）取齐：细一档在虚线上会退成"若有若无"的灰线，尤其琥珀在
 * 浅色底上。虚实之别已经足够区分「这一片归谁」和「你正指着这个」，不需要再靠
 * 粗细多说一遍。
 */
const OUTLINE = 'rounded-sm border-2 border-dashed'

export interface InspectorOverlayProps {
  t: TranslateNS<'dsh-insight'>
  /** 修饰键正按着：浮层接管指针。 */
  armed: boolean
  /** 这一屏里的非官方插入。 */
  foreign: readonly ForeignMark[]
  hit: InspectorHit | undefined
  menu: InspectorMenu | undefined
  /** 菜单里点一层。 */
  onPick(frame: SlotFrame): void
  /** 这个包名能不能落到插件轴上（在 host 插件树里找得到）。 */
  canJump(pkg: string | undefined): boolean
}

function boxStyle(box: Box): CSSProperties {
  return { top: box.top, left: box.left, width: box.width, height: box.height }
}

/**
 * 贴着目标放，但夹在视口里。
 *
 * `100%` 在 transform 的百分比里指**自身尺寸**，所以「不越出视口」纯 CSS 就能
 * 夹住，不必先量一遍宽高（量就要多渲染一帧，牌子会闪）。`desired` 允许是
 * calc 表达式——上方摆放要减掉自身高度，只有 calc 写得出来。
 */
function clamped(desired: string, axis: 'x' | 'y'): string {
  const viewport = axis === 'x' ? '100vw' : '100vh'
  return `clamp(${GUTTER}px, ${desired}, calc(${viewport} - 100% - ${GUTTER}px))`
}

/** 一层归因的两行文本：谁插的 + 插在哪。 */
function frameLines(t: TranslateNS<'dsh-insight'>, frame: SlotFrame | undefined, anchorSlot: string | undefined): { who: string; where: string; known: boolean } {
  const slot = frame?.slotKey ?? anchorSlot
  const cell = frame?.entryKey ?? frame?.entryId
  const where = slot === undefined ? '' : cell === undefined ? slot : `${slot} · ${cell}`
  if (frame?.pkg !== undefined) return { who: frame.pkg, where, known: true }
  // 记不到账时把压缩的 registrant 也摆出来：它认不出包，但能看出「是不是同一个」
  const hint = frame?.registrant === undefined ? t('inspector.unknown') : t('inspector.unknownAs', { name: frame.registrant })
  return { who: hint, where, known: false }
}

export function InspectorOverlay({ t, armed, foreign, hit, menu, onPick, canJump }: InspectorOverlayProps) {
  const capture = armed || menu !== undefined
  const showHit = menu === undefined && hit !== undefined
  // 节点常驻（哪怕什么都不画）：按需挂载会让「接管指针」比按键晚一帧，那一帧
  // 里 hover 还是会穿到页面上。空的 inset-0 + pointer-events:none 不碍任何事。
  return createPortal(
    <div
      {...{ [INSPECTOR_ATTR]: '' }}
      className={`dsh-insight fixed inset-0 z-[2147483000] ${capture ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
    >
      {armed && foreign.map(mark => (
        <div
          key={`${mark.pkg}|${mark.slotKey ?? ''}|${mark.box.top},${mark.box.left}`}
          className={`pointer-events-none absolute ${OUTLINE} border-warn/45`}
          style={boxStyle(mark.box)}
        />
      ))}
      {armed && foreign.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-surface-2 px-3 py-1.5 text-[11px] whitespace-nowrap shadow-lg ring-1 ring-line">
          {/* 图示不是页面上的框：10px 的小方块配 2px 边框就只剩边框了，这里留 1px */}
          <span className="mr-1.5 inline-block size-2.5 rounded-sm border border-dashed border-warn/70 bg-warn/15 align-middle" />
          <span className="text-secondary">{t('inspector.foreignLegend', { count: foreign.length })}</span>
        </div>
      )}
      {showHit && hit.territory !== undefined && (
        <div className={`pointer-events-none absolute ${OUTLINE} border-brand-bright/45`} style={boxStyle(hit.territory)} />
      )}
      {showHit && (
        <div className="pointer-events-none absolute rounded-sm border-2 border-brand-bright bg-brand-bright/12" style={boxStyle(hit.box)} />
      )}
      {showHit && <HitBadge t={t} hit={hit} />}
      {menu !== undefined && <FrameMenu t={t} menu={menu} onPick={onPick} canJump={canJump} />}
    </div>,
    document.body,
  )
}

/**
 * 命中提示条：贴着**鼠标**放，不贴高亮框。
 *
 * 贴框是最初的做法，但框可能是整条侧栏那么大——牌子于是跑到框底下、离鼠标一
 * 屏远，甚至掉出视口。贴鼠标就永远在视线里、永远离手近。默认放在光标右下，
 * 下方或右侧不够时由 clamp 拉回来（`100%` 是牌子自身尺寸，见 clamped）。
 */
function HitBadge({ t, hit }: { t: TranslateNS<'dsh-insight'>; hit: InspectorHit }) {
  const frame = hit.frames.find(f => f.pkg !== undefined) ?? hit.frames[0]
  const { who, where, known } = frameLines(t, frame, hit.anchorSlot)
  // 光标下方放不下就翻到上方（减掉自身高度只能用 calc 表达）
  const below = `${Math.round(hit.pointer.y) + 18}px`
  const above = `calc(${Math.round(hit.pointer.y) - 14}px - 100%)`
  const roomBelow = window.innerHeight - hit.pointer.y > 140
  const style: CSSProperties = {
    left: 0,
    top: 0,
    transform: `translate(${clamped(`${Math.round(hit.pointer.x) + 12}px`, 'x')}, ${clamped(roomBelow ? below : above, 'y')})`,
    maxWidth: `calc(100vw - ${GUTTER * 2}px)`,
  }
  return (
    <div className="pointer-events-none absolute w-max rounded-lg bg-surface-2 px-3 py-2 shadow-lg ring-1 ring-line" style={style}>
      <div className={`truncate text-[13px] font-medium ${known ? 'text-primary' : 'text-warn'}`}>{who}</div>
      {where !== '' && <div className="truncate font-mono text-[11px] text-tertiary">{where}</div>}
      <div className="mt-1 text-[11px] text-caption">{t('inspector.badgeHint')}</div>
    </div>
  )
}

/**
 * 层级菜单：由内向外一层一层，点哪层跳哪层的插件。
 *
 * 滑过某一层时背后框出那一层管的地方——不然「当前 → 根」这五六行长得都差不多，
 * 光看名字分不出哪层对应屏幕上的哪块。
 */
function FrameMenu({ t, menu, onPick, canJump }: { t: TranslateNS<'dsh-insight'>; menu: InspectorMenu; onPick: (frame: SlotFrame) => void; canJump: (pkg: string | undefined) => boolean }) {
  const [hovered, setHovered] = useState<number | undefined>(undefined)
  const style: CSSProperties = {
    left: 0,
    top: 0,
    transform: `translate(${clamped(`${Math.round(menu.x)}px`, 'x')}, ${clamped(`${Math.round(menu.y)}px`, 'y')})`,
  }
  const preview = hovered === undefined ? undefined : menu.levels[hovered]?.box
  return (
    <>
      {preview !== undefined && (
        <div className="pointer-events-none absolute rounded-sm border-2 border-brand-bright bg-brand-bright/12" style={boxStyle(preview)} />
      )}
      <div
        {...{ [INSPECTOR_UI_ATTR]: '' }}
        className="pointer-events-auto absolute w-[360px] max-w-[calc(100vw-16px)] overflow-hidden rounded-lg bg-surface-2 shadow-xl ring-1 ring-line"
        style={style}
        onMouseLeave={() => setHovered(undefined)}
      >
        <div className="border-b border-line px-3 py-2">
          <div className="text-[12px] font-medium text-secondary">{t('inspector.menuTitle')}</div>
          <div className="text-[11px] text-caption">{t('inspector.menuHint')}</div>
        </div>
        <div className="max-h-[260px] overflow-y-auto py-1">
          {menu.levels.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-tertiary">
              {menu.anchorSlot === undefined ? t('inspector.noFrames') : t('inspector.onlyAnchor', { slot: menu.anchorSlot })}
            </div>
          )}
          {menu.levels.map((level, i) => (
            <MenuRow
              key={`${level.frame.slotKey ?? '?'}/${level.frame.entryKey ?? level.frame.entryId ?? i}`}
              t={t}
              level={level}
              jumpable={level.frame.pkg !== undefined && canJump(level.frame.pkg)}
              onEnter={() => setHovered(i)}
              onPick={() => onPick(level.frame)}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function MenuRow({ t, level, jumpable, onEnter, onPick }: {
  t: TranslateNS<'dsh-insight'>
  level: MenuLevel
  jumpable: boolean
  onEnter: () => void
  onPick: () => void
}) {
  const { who, where, known } = frameLines(t, level.frame, undefined)
  return (
    <button
      type="button"
      disabled={!jumpable}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onClick={onPick}
      className={`flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left ${jumpable ? 'hover:bg-hover' : 'cursor-default'} ${jumpable ? '' : 'opacity-70'}`}
    >
      <span className={`w-full truncate text-[12px] ${known ? 'text-primary' : 'text-warn'}`}>{who}</span>
      {where !== '' && <span className="w-full truncate font-mono text-[11px] text-tertiary">{where}</span>}
      {known && !jumpable && <span className="text-[11px] text-caption">{t('inspector.notInTree')}</span>}
    </button>
  )
}
