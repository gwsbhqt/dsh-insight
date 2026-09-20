/**
 * 开关按钮跟**配置**走，不跟运行时走。
 *
 * 真实踩过的那一幕：点「禁用」→ 补丁层写进去了 → 但这个进程没把插件卸下来 →
 * 按钮还写着「禁用」，看起来像什么都没发生，再点一次只会得到「本来就是禁用」。
 */
import { expect, it } from 'vitest'
import { configuredOff, pendingRestart } from '../src/client/components/Workbench.tsx'
import type { PluginDossier } from '../src/shared/dossier.ts'

function row(patch: Partial<PluginDossier> = {}): PluginDossier {
  return {
    id: 'llm-deepseek',
    shortId: 'llm-deepseek',
    name: '@deepseek-ai/dsh-llm-deepseek',
    group: false,
    disabled: false,
    state: 'active',
    provides: [],
    requires: [],
    children: [],
    ...patch,
  }
}

it('配置说禁用、运行时还活着：算「待重启」，按钮给「启用」', () => {
  const d = row({ state: 'active', drift: 'mismatch', intent: { disabled: true, config: {} } })
  expect(pendingRestart(d)).toBe(true)
  expect(configuredOff(d)).toBe(true)
})

it('配置撤回了禁用、运行时还关着：同样是待重启，按钮给「禁用」', () => {
  const d = row({ state: 'disabled', disabled: true, drift: 'mismatch', intent: { disabled: false, config: {} } })
  expect(pendingRestart(d)).toBe(true)
  expect(configuredOff(d)).toBe(false)
})

it('没有错位就照运行时说的办', () => {
  expect(configuredOff(row({ state: 'active' }))).toBe(false)
  expect(configuredOff(row({ state: 'disabled', disabled: true }))).toBe(true)
  expect(pendingRestart(row({ state: 'active' }))).toBe(false)
})

it('对账说错位但没挂上意图（撞名放弃归因）时不猜，退回运行时', () => {
  const d = row({ state: 'active', drift: 'mismatch' })
  expect(pendingRestart(d)).toBe(false)
  expect(configuredOff(d)).toBe(false)
})
