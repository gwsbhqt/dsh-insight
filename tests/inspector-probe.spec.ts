/**
 * 记账补丁：在内存里给 slots 服务原型的 register 包一层，注册发生时把
 * 「entry → 明文包名」记下来。这里盯的是三件不能出错的事：
 *
 *   1. 别人的注册行为完全不变（参数、返回值、this 全透传）；
 *   2. 记账失败只是少一条账，不能让注册跟着失败；
 *   3. 还原干净、装两次只包一层——插件会被 HMR 反复装卸。
 */
import { expect, it, vi } from 'vitest'
import { installRegistrantProbe, pkgOfEntry } from '../src/client/inspector/probe.ts'

interface StoredEntryLike { component: unknown; registrant?: string }

/**
 * 假的 slots 服务：方法在原型上（真实运行时也是），实例上放 entries 台账。
 * `callAs` 模拟 cordis 的 caller-traced 调用——方法里的 this.ctx 指向调用方
 * 插件，插件 fiber 上挂着它的 loader entry。
 */
function fakeSlots(pkgName: string | undefined) {
  const store = new Map<string, StoredEntryLike[]>()
  class Slots {
    register(options: { name: string }, component: unknown): () => void {
      const list = store.get(options.name) ?? []
      const entry: StoredEntryLike = { component, registrant: 'Z8' }
      list.push(entry)
      store.set(options.name, list)
      return () => {
        const i = list.indexOf(entry)
        if (i >= 0) list.splice(i, 1)
      }
    }
    entries(key: string): readonly StoredEntryLike[] {
      return store.get(key) ?? []
    }
  }
  const instance = new Slots()
  const caller = {
    ...(pkgName === undefined ? {} : { ctx: { fiber: { entry: { options: { name: pkgName } } } } }),
    entries: (key: string) => instance.entries(key),
  }
  /** 以「调用方插件」的身份调 register（this 带 ctx，方法体来自原型）。 */
  const callAs = (options: { name: string }, component: unknown): () => void => {
    const fn = Object.getPrototypeOf(instance).register as (this: unknown, o: unknown, c: unknown) => () => void
    return fn.call(caller, options, component)
  }
  return { instance, store, callAs }
}

it('注册发生时记下明文包名，可按 entry 查回来', () => {
  const { instance, store, callAs } = fakeSlots('@deepseek-ai/dsh-client-ui-conversation')
  const restore = installRegistrantProbe(instance)
  const component = () => null
  callAs({ name: 'conversation.chat.node' }, component)
  const entry = store.get('conversation.chat.node')![0]!
  expect(pkgOfEntry(entry)).toBe('@deepseek-ai/dsh-client-ui-conversation')
  restore()
})

it('注册行为透传：返回的 disposer 仍然能摘掉那条注册', () => {
  const { instance, store, callAs } = fakeSlots('@gwsbhqt/dsh-insight')
  const restore = installRegistrantProbe(instance)
  const dispose = callAs({ name: 'shell.overlay' }, () => null)
  expect(store.get('shell.overlay')).toHaveLength(1)
  dispose()
  expect(store.get('shell.overlay')).toHaveLength(0)
  restore()
})

it('调用方拿不到 loader entry 时不记账，也不抛', () => {
  const { instance, store, callAs } = fakeSlots(undefined)
  const restore = installRegistrantProbe(instance)
  expect(() => callAs({ name: 'settings.section' }, () => null)).not.toThrow()
  expect(pkgOfEntry(store.get('settings.section')![0]!)).toBeUndefined()
  restore()
})

it('台账读取抛错时注册照样成功', () => {
  const { instance, store } = fakeSlots('@gwsbhqt/dsh-insight')
  const restore = installRegistrantProbe(instance)
  const component = () => null
  const fn = Object.getPrototypeOf(instance).register as (this: unknown, o: unknown, c: unknown) => () => void
  const brokenCaller = {
    ctx: { fiber: { entry: { options: { name: '@gwsbhqt/dsh-insight' } } } },
    entries: () => { throw new Error('boom') },
  }
  expect(() => fn.call(brokenCaller, { name: 'settings.action' }, component)).not.toThrow()
  expect(store.get('settings.action')).toHaveLength(1)
  // entry 维度记不到，退到组件引用那条账
  expect(pkgOfEntry({ component })).toBe('@gwsbhqt/dsh-insight')
  restore()
})

it('装两次只包一层，还原后 register 回到原函数', () => {
  const { instance } = fakeSlots('@gwsbhqt/dsh-insight')
  const proto = Object.getPrototypeOf(instance) as { register: unknown }
  const original = proto.register
  const restore = installRegistrantProbe(instance)
  const patched = proto.register
  expect(patched).not.toBe(original)
  const second = installRegistrantProbe(instance)
  expect(proto.register).toBe(patched) // 第二次是空操作
  second()
  expect(proto.register).toBe(patched) // 空操作的还原不该动补丁
  restore()
  expect(proto.register).toBe(original)
})

it('还原之后别人再包的那层不会被顶掉', () => {
  const { instance } = fakeSlots('@gwsbhqt/dsh-insight')
  const proto = Object.getPrototypeOf(instance) as { register: unknown }
  const restore = installRegistrantProbe(instance)
  const theirs = vi.fn()
  proto.register = theirs
  restore()
  expect(proto.register).toBe(theirs)
})

it('原型上没有 register 时安全跳过', () => {
  expect(() => installRegistrantProbe({})()).not.toThrow()
})
