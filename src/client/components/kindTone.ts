/**
 * 归因动作（insert/update/disable/enable）的着色。
 *
 * 沿用 Tag 的健康度轴，不是给「类别」分配颜色：
 *   插入 = 灰。每个 bundle 都会插自己的插件，出现在几乎每一层上，是常量不是信号。
 *   覆盖 = 蓝。这一层改了别人的配置——「有人动过」。
 *   禁用 = 红。这一层把别人关停了——层里最重的一个动作。
 *   启用 = 灰。把默认关掉的打开，回到正常态。
 * 层行上因此一眼能看出「哪一层做了有意思的事」：dsh-web-app 的「禁用 22」是红的，
 * 而它的「插入 57」是灰的——旧实现里后者是绿色且占了展开区三分之二篇幅。
 */
import type { AttributionEvent } from '../../shared/types.ts'
import type { TagTone } from './Tag.tsx'

export const KIND_TONE: Record<AttributionEvent['kind'], TagTone> = {
  insert: 'dim',
  update: 'info',
  disable: 'err',
  enable: 'dim',
}

export const KIND_KEY: Record<AttributionEvent['kind'], 'event.insert' | 'event.update' | 'event.disable' | 'event.enable'> = {
  insert: 'event.insert',
  update: 'event.update',
  disable: 'event.disable',
  enable: 'event.enable',
}

/** 展示顺序：有意思的排前面，插入垫底。 */
export const KIND_ORDER: AttributionEvent['kind'][] = ['update', 'disable', 'enable', 'insert']

/** 分组左边条颜色（Tailwind 扫描只认字面类名，不能 border-${tone} 动态拼）。 */
export const KIND_BAR: Record<AttributionEvent['kind'], string> = {
  insert: 'border-line-2',
  update: 'border-brand-bright',
  disable: 'border-err',
  enable: 'border-line-2',
}
