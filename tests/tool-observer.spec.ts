/** 工具注册观察器：包装层绝不能影响注册本身，且要幂等、可还原。 */
import { expect, it } from 'vitest'
import { callerPackage, installToolObserver, observedTools } from '../src/host/tool-observer.ts'

class FakeTools {
  readonly seen: unknown[] = []
  register(def: unknown): string { this.seen.push(def); return 'disposer' }
}

it('调用栈里跳过框架包，取第一个真实注册者', () => {
  const stack = [
    'Error: trace',
    '  at register (/x/node_modules/@deepseek-ai/dsh-tools/lib/index.js:1:1)',
    '  at apply (/x/node_modules/@deepseek-ai/cordis/lib/index.js:120:36)',
    '  at plugin (/x/node_modules/@deepseek-ai/dsh-tool-bash/lib/index.js:259:12)',
  ].join('\n')
  expect(callerPackage(stack)).toBe('@deepseek-ai/dsh-tool-bash')
})

it('全是框架帧时不硬猜', () => {
  expect(callerPackage('Error\n  at f (/x/node_modules/@deepseek-ai/cordis/lib/index.js:1:1)')).toBeUndefined()
})

it('注册照常透传，并被记下来', () => {
  const tools = new FakeTools()
  const restore = installToolObserver(tools)
  expect(tools.register({ name: 'demo_tool', description: 'd' })).toBe('disposer')  // 返回值不变
  expect(tools.seen).toHaveLength(1)                                                 // 原实现照常收到
  expect(observedTools().some(t => t.name === 'demo_tool')).toBe(true)
  restore()
})

it('记账抛错也不影响注册——definition 是奇怪的值也不炸', () => {
  const tools = new FakeTools()
  const restore = installToolObserver(tools)
  expect(() => tools.register(null)).not.toThrow()
  expect(() => tools.register(Object.create(null) as object)).not.toThrow()
  expect(tools.seen).toHaveLength(2)
  restore()
})

it('幂等：重复装不套娃', () => {
  const tools = new FakeTools()
  const r1 = installToolObserver(tools)
  const wrapped = Object.getPrototypeOf(tools).register
  const r2 = installToolObserver(tools)
  expect(Object.getPrototypeOf(tools).register).toBe(wrapped)   // 第二次没再包
  r2(); r1()
})

it('还原后回到原方法', () => {
  const tools = new FakeTools()
  const before = Object.getPrototypeOf(tools).register
  installToolObserver(tools)()
  expect(Object.getPrototypeOf(tools).register).toBe(before)
})

it('tools 服务缺席时安静跳过', () => {
  expect(() => installToolObserver(undefined)()).not.toThrow()
  expect(() => installToolObserver({} as object)()).not.toThrow()
})
