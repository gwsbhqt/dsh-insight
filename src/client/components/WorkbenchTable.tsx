/**
 * 工作台左栏的表格骨架：四根轴（按插件 / 按层 / 按服务 / 按工具）共用同一套
 * 行高、网格、选中态、分隔线、右列对齐。
 *
 * 为什么要抽成组件而不是各写各的：一个对话框里出现三种行高、两种布局范式、
 * 一半有表头一半没有，看起来就像四个页面拼起来的。靠复制 class 串维持一致
 * 只能撑到下一次改动——固化成组件之后，「长什么样」不再是每个轴各自的自觉。
 *
 * 分工：**这里只管长什么样，不管放什么。** 列数、列宽、列名、每格内容都由
 * 各轴自己定——它们要回答的问题不同，内容本来就该不一样。
 */
import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { ChevronIcon, HelpIcon } from './icons.tsx'

/** 一列的定义：列名 + 宽度（grid-template 的一段）+ 对齐。 */
export interface Column {
  label: string
  /** grid-template-columns 里的一段，如 `minmax(0,1fr)` / `96px`。 */
  width: string
  align?: 'right'
  /**
   * 「这一列怎么读」——列名后挂一个问号，hover 才出。
   * 常驻的说明文字会一直占着一行，而它只在第一次看这张表时有用。
   */
  hint?: string
}

const ColsContext = createContext<string>('')

function template(columns: Column[]): string {
  return columns.map(c => c.width).join(' ')
}

export interface TableProps {
  columns: Column[]
  children: ReactNode
}

/** 行高：Row / GroupRow / 滚过末行的留白共用同一个值。 */
export const ROW_HEIGHT = 34

/** 行的左内边距。 */
export const ROW_PAD = 18

/**
 * 树形缩进一级的量。折叠组展开出来的子行一律缩进一级——不管那个组是插件容器、
 * 「已禁用 N 个」还是「可配未配的 provider」：缩进的含义只有一个，「这些属于上面那条」。
 */
export const INDENT_STEP = 15

/**
 * 滚过最后一行：内容真的溢出时，在末尾垫半屏空白，让最后一行能滚到可视区中间。
 * 折叠展开后目标行不至于卡在屏幕最底下够不着，又不至于像「一直滚到只剩一行」
 * 那样底下拖着一大片空白。
 *
 * 「可视区」要扣掉粘顶表头：表头浮在滚动内容之上，按容器高度算会多垫出一个表头
 * 的量，末行反而被表头压住。
 *
 * 用实测而不是 `height: calc(100% - 34px)`：百分比会解析到 Table 自己那个
 * auto 高度的容器上，算出来是 0。另外内容没溢出时不留白，否则七行的列表也能滚，
 * 白白多出一段空白。
 */
function useScrollPastEnd(
  bodyRef: React.RefObject<HTMLDivElement | null>,
  headRef: React.RefObject<HTMLDivElement | null>,
): number {
  const [pad, setPad] = useState(0)
  useLayoutEffect(() => {
    const body = bodyRef.current
    const scroller = body?.parentElement?.parentElement ?? null // body → Table 容器 → 滚动容器
    if (body === null || scroller === null) return undefined
    const update = () => {
      const head = headRef.current?.getBoundingClientRect().height ?? 0
      const view = scroller.clientHeight - head // 表头之下真正看得见的那段
      // 量 body 自身高度，不含留白——否则留白会把自己算成溢出，来回震荡
      const overflows = body.getBoundingClientRect().height > view
      setPad(overflows ? Math.max(ROW_HEIGHT, Math.round(view / 2)) : 0)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(scroller)
    ro.observe(body)
    return () => ro.disconnect()
  })
  return pad
}

/** 表格容器：渲染粘顶表头，并把网格模板传给行。 */
export function Table({ columns, children }: TableProps) {
  const cols = template(columns)
  const bodyRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const pad = useScrollPastEnd(bodyRef, headRef)
  return (
    <ColsContext.Provider value={cols}>
      <div>
        <div ref={headRef} className="sticky top-0 z-[1] border-b border-line bg-surface px-[18px] py-[7px] font-mono text-[11px] tracking-[0.1em] text-tertiary uppercase">
          <div className="grid w-full gap-3" style={{ gridTemplateColumns: cols }}>
            {columns.map(c => (
              <span key={c.label} className={`flex items-center gap-1 ${c.align === 'right' ? 'justify-end' : ''}`}>
                {c.label}
                {c.hint !== undefined && (
                  <Tooltip label={c.hint} side="bottom">
                    <span tabIndex={0} aria-label={c.hint}
                      className="inline-flex cursor-help items-center text-tertiary transition-colors duration-150 hover:text-secondary">
                      <HelpIcon />
                    </span>
                  </Tooltip>
                )}
              </span>
            ))}
          </div>
        </div>
        <div ref={bodyRef}>{children}</div>
        <div aria-hidden="true" style={{ height: pad }} />
      </div>
    </ColsContext.Provider>
  )
}

export interface RowProps {
  selected?: boolean
  onClick?: (() => void) | undefined
  /** 树形缩进；不传就是标准的左边距。 */
  indent?: number | undefined
  children: ReactNode
}

/** 一行：高度、分隔线、选中态左边条全在这里定死。 */
export function Row({ selected = false, onClick, indent, children }: RowProps) {
  const cols = useContext(ColsContext)
  return (
    <button
      type="button"
      data-selected={selected}
      onClick={onClick}
      className={`grid w-full cursor-pointer items-center gap-3 border-l-2 pr-[18px] text-left transition-colors duration-150 ${selected ? 'border-brand-bright bg-hover' : 'border-transparent hover:bg-hover'}`}
      style={{ gridTemplateColumns: cols, paddingLeft: indent ?? ROW_PAD, height: ROW_HEIGHT }}
    >
      {children}
    </button>
  )
}

/** 折叠组行（已禁用 N 条 / 插件容器）：与数据行同高、同缩进、同左边条槽位，但不参与选中。 */
export function GroupRow({ open, onToggle, indent, children }: {
  open: boolean
  onToggle: () => void
  indent?: number | undefined
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-[9px] border-l-2 border-transparent pr-[18px] text-left text-[12.5px] text-tertiary transition-colors duration-150 hover:bg-hover"
      style={{ paddingLeft: indent ?? ROW_PAD, height: ROW_HEIGHT }}
    >
      <ChevronBox open={open} />
      {children}
    </button>
  )
}

/**
 * 箭头槽位：20px 见方、左移 4px。数据行的树形前缀（箭头或占位）和折叠组行都用它，
 * 两种行的文字才会落在同一条竖线上——差 7px 肉眼是看得出来的。
 */
export function ChevronBox({ open, onClick }: { open: boolean; onClick?: (e: React.MouseEvent) => void }) {
  const box = '-ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded'
  if (onClick === undefined) return <span className={box}><Chevron open={open} /></span>
  return (
    <span role="button" tabIndex={-1} aria-expanded={open} onClick={onClick}
      className={`${box} cursor-pointer text-tertiary hover:bg-hover hover:text-primary`}>
      <Chevron open={open} />
    </span>
  )
}

/** 占位：没有子节点的行也要占掉同样的槽位，否则标题会左移一格。 */
export function ChevronSlot() {
  return <span className="-ml-1 inline-block size-5 shrink-0" />
}

/** 折叠箭头。translate-y-px 是光学补偿：盒中心已经对齐，但正文有降部（g/p）
 * 把墨迹重心压低，几何居中的箭头看起来偏高，下沉 1px 才是视觉齐平。 */
export function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`inline-flex shrink-0 translate-y-px items-center transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>
      <ChevronIcon />
    </span>
  )
}

/**
 * 主标识格：等宽、截断，首列固定留出一条 25px 的槽位。
 *
 * 槽位里放什么由各轴自己定——按配置放序号，按插件/按工具/按模型放折叠箭头或占位，
 * 按服务空着。但**宽度是固定的**：五张表切来切去，第一列的文字必须落在同一条竖线上，
 * 否则每切一次轴整列都在跳。
 */
export function NameCell({ children, dim = false, bold = false, prefix }: {
  children: ReactNode
  dim?: boolean
  bold?: boolean
  prefix?: ReactNode
}) {
  return (
    <span className={`flex min-w-0 items-center gap-[9px] font-mono text-[12.5px] ${bold ? 'font-semibold' : ''} ${dim ? 'text-tertiary' : 'text-primary'}`}>
      {prefix ?? <ChevronSlot />}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}

/** 次标识格：更小、更淡、截断。 */
export function SubCell({ children }: { children: ReactNode }) {
  return <span className="truncate font-mono text-[11.5px] text-tertiary">{children}</span>
}

/**
 * 标记格：0..2 个标记并排。
 * 一行上可能同时成立好几件事（已禁用 + 三方、源码推测 + 三方），挑一个显示等于
 * 把另一个藏起来；并排放才是实话。空的自己不占位。
 */
export function Marks({ align = 'left', children }: { align?: 'left' | 'right'; children: ReactNode }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 truncate text-[11.5px] ${align === 'right' ? 'justify-end' : ''}`}>
      {children}
    </span>
  )
}

/** 右对齐的量或标记格。空着也要占位——否则网格列数对不上，右列会整体左移。 */
export function EndCell({ children }: { children?: ReactNode }) {
  return <span className="flex items-center justify-end gap-[7px] text-[11.5px] text-tertiary tabular-nums">{children}</span>
}

/** 量条：服务的「被依赖」、工具的「连带」共用，视觉重量一致。 */
export function Meter({ value, max, heavy = false }: { value: number; max: number; heavy?: boolean }) {
  return (
    <i
      className={`h-[5px] shrink-0 rounded-[3px] ${heavy ? 'bg-brand-bright' : 'bg-dimmed opacity-55'}`}
      style={{ width: Math.max(3, Math.round((value / Math.max(max, 1)) * 52)) }}
    />
  )
}
