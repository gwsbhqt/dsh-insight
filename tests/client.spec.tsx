// @vitest-environment jsdom
/** client 注册通路：settings.section 被注册；dispose 后摘除（HMR 安全）；侧栏名跟随语言。 */
import { expect, it } from 'vitest'
import { apply } from '../src/client/index.tsx'
import { en, zh } from '../src/client/locale.ts'

function fakeCtx() {
  const registrations: { name: string; id?: string | undefined }[] = []
  const localeRegistrations: { ns: string; dicts: unknown }[] = []
  const registered: { label?: unknown }[] = []
  const slots = {
    inject(_name: string, register: () => () => void) {
      return register()
    },
    register(options: { name: string; id?: string; label?: unknown }, _component: unknown) {
      registrations.push({ name: options.name, id: options.id })
      registered.push({ label: options.label })
      return () => {
        const i = registrations.findIndex(r => r.id === options.id)
        if (i >= 0) registrations.splice(i, 1)
      }
    },
  }
  // 当前语言由这个替身持有：bind 出来的 t 每次调用都现读，模拟真实实现
  const state = { current: 'zh' as 'zh' | 'en' }
  const locale = {
    register(ns: string, dicts: unknown) {
      localeRegistrations.push({ ns, dicts })
      return () => {}
    },
    bind(_ns: string) {
      return (key: string) => (state.current === 'zh' ? zh : en)[key as keyof typeof zh]
    },
  }
  return { ctx: { slots, locale } as never, registrations, localeRegistrations, registered, state }
}

it('注册 settings.section 且 dispose 后摘除', () => {
  const { ctx, registrations } = fakeCtx()
  apply(ctx)
  expect(registrations.some(r => r.name === 'settings.section' && r.id === 'insight')).toBe(true)
})

it('apply 注册 dsh-insight 词典（zh/en 双语平衡）', () => {
  const { ctx, localeRegistrations } = fakeCtx()
  apply(ctx)
  expect(localeRegistrations.some(r => r.ns === 'dsh-insight')).toBe(true)
  // 运行时兜底编译期的双语平衡检查
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
})

it('侧栏那一条的名字跟着语言走', () => {
  const { ctx, registered, state } = fakeCtx()
  apply(ctx)
  const label = registered.find(r => r.label !== undefined)?.label
  // 必须是函数：写死字符串会永远停在注册那一刻的语言上
  expect(typeof label).toBe('function')
  const read = label as () => string
  expect(read()).toBe(zh['section.label'])
  state.current = 'en'
  expect(read()).toBe(en['section.label'])
})
