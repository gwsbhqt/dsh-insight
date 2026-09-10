/**
 * dsh-insight client 半：设置面板的「洞察」section。
 * 模块表懒 CJS：本文件是 factory 体，exports 的 name/inject/apply 由浏览器 Loader 消费。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// 纯声明合并：ctx.slots 的 Context 增强。dsh 0.1.2 起由 ui-renderer 提供
// （原先在 dsh-client-runtime，那个包已下线）。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// 纯声明合并：把 'settings.section' 带上 SlotMap。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// 纯声明合并：把 'shell.overlay' 带上 SlotMap（inspector 的浮层挂在那里）。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// 纯声明合并：ctx.locale 的 Context 增强。类型导入会被擦除，不进 bundle。
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { installStyles } from './styles.ts'
import { en, INSIGHT_NS, zh } from './locale.ts'
import { InsightSection } from './components/InsightSection.tsx'
import { InspectorHost } from './inspector/InspectorHost.tsx'
import { installRegistrantProbe } from './inspector/probe.ts'

export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  // 样式先行：注册之后随时可能渲染，晚到会闪无样式内容。
  installStyles()
  // 词典先注册（registration bump revision，已挂载的 outlet 会拿到晚到的词典）。
  ctx.locale.register(INSIGHT_NS, { zh, en })
  // 侧栏那一条的名字也要跟着语言走。label 传函数（不是字符串）——外壳在每次渲染时
  // 才求值，切语言立刻变；写死字符串的话它会永远停在注册那一刻的语言上。
  const t = ctx.locale.bind(INSIGHT_NS)

  /*
   * Inspector 的记账补丁：在 slots 服务原型的 register 外面包一层，把「这条
   * slot 注册来自哪个包」记下来（见 inspector/probe.ts）。
   *
   * 为什么在这里、而且不受 inspector 开关约束：它只记得到**装上之后**的注册，
   * 装得越早认得出的界面越多；而它本身不改任何行为——原方法照常执行，之后多写
   * 一条 WeakMap 而已。开关管的是另一半（按住修饰键时拦截点击），那半才会改变
   * 页面的手感，所以那半默认关着。
   *
   * 补丁只活在内存里那个原型对象上，effect 随插件卸载按栈还原；dsh 自己的文件
   * 一个字节都不动。
   */
  try {
    const slots: unknown = ctx.get('slots')
    if (typeof slots === 'object' && slots !== null) {
      ctx.effect(() => installRegistrantProbe(slots), 'dsh-insight inspector registrant probe')
    }
  } catch {
    // 宿主版本错位（拿不到服务实例或没有 effect）时只是少了包名归因，
    // 不该连带把整块洞察面板拖没——这个包的其他部分不依赖它。
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register(
    // locale 声明把 typed t seat 放上组件 props，语言切换自动重渲染。
    { name: 'settings.section', id: 'insight', order: 90, label: () => t('section.label'), locale: INSIGHT_NS },
    props => <InsightSection ctx={ctx} t={props.t} />,
  ))

  /*
   * Inspector 的浮层挂 'shell.overlay'——ui-layout 指定的「浮在整个 app 之上」
   * 的位置：list slot（additive，不跟别人抢），且在自己开启 pointer-events 之前
   * 对点击透明。关着的时候这个组件不装监听、不发请求。
   */
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    { name: 'shell.overlay', id: 'insight-inspector', locale: INSIGHT_NS },
    props => <InspectorHost ctx={ctx} t={props.t} />,
  ))
}
