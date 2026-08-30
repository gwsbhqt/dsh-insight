/**
 * dsh-insight client 半：设置面板的「洞察」section。
 * 模块表懒 CJS：本文件是 factory 体，exports 的 name/inject/apply 由浏览器 Loader 消费。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// 纯声明合并：把 'settings.section' 带上 SlotMap。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// 纯声明合并：ctx.locale 的 Context 增强。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { installStyles } from './styles.ts'
import { en, INSIGHT_NS, zh } from './locale.ts'
import { InsightSection } from './components/InsightSection.tsx'

export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  // 样式先行：注册之后随时可能渲染，晚到会闪无样式内容。
  installStyles()
  // 词典先注册（registration bump revision，已挂载的 outlet 会拿到晚到的词典）。
  ctx.locale.register(INSIGHT_NS, { zh, en })
  // 侧栏那一条的名字也要跟着语言走。label 传函数（不是字符串）——外壳在每次渲染时
  // 才求值，切语言立刻变；写死字符串的话它会永远停在注册那一刻的语言上。
  const t = ctx.locale.bind(INSIGHT_NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    // locale 声明把 typed t seat 放上组件 props，语言切换自动重渲染。
    { name: 'settings.section', id: 'insight', order: 90, label: () => t('section.label'), locale: INSIGHT_NS },
    props => <InsightSection ctx={ctx} t={props.t} />,
  ))
}
