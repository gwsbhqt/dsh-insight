/** 工具插件归并：同名两份（宿主面 / 预设 realm）合成一条，净状态取「任一份在跑」。 */
import { expect, it } from 'vitest'
import { buildToolPlugins, countTools } from '../src/shared/tools.ts'
import type { PluginDossier } from '../src/shared/dossier.ts'

const d = (id: string, shortId: string, p: Partial<PluginDossier> = {}): PluginDossier => ({
  id, shortId, name: `@deepseek-ai/dsh-${shortId}`, group: false, disabled: false,
  state: 'active', provides: [], requires: [], children: [], ...p,
})

it('只收 tool- 开头的 entry', () => {
  const tools = buildToolPlugins([d('include:tool-bash', 'tool-bash'), d('include:llm', 'llm')])
  expect(tools.map(t => t.id)).toEqual(['tool-bash'])
})

it('同名两份归并成一条，realm 区分宿主面与预设', () => {
  const tools = buildToolPlugins([
    d('include:tool-bash', 'tool-bash', { state: 'disabled', disabled: true }),
    d('include:agent-presets:tool-bash', 'tool-bash'),
  ])
  expect(tools).toHaveLength(1)
  expect(tools[0]!.entries.map(e => e.realm)).toEqual(['', 'agent-presets'])
  expect(tools[0]!.enabled).toBe(true)     // 预设里那份在跑 → agent 拿得到
  expect(tools[0]!.split).toBe(true)       // 两份状态不一致，值得标出来
})

it('两份都禁用 = 不可用，且不算状态不一致', () => {
  const tools = buildToolPlugins([
    d('include:tool-pwsh', 'tool-pwsh', { state: 'disabled', disabled: true }),
    d('include:agent-presets:tool-pwsh', 'tool-pwsh', { state: 'disabled', disabled: true }),
  ])
  expect(tools[0]!.enabled).toBe(false)
  expect(tools[0]!.split).toBe(false)
})

it('可用的排前面，同档按名字', () => {
  const tools = buildToolPlugins([
    d('include:tool-zeta', 'tool-zeta', { state: 'disabled', disabled: true }),
    d('include:tool-beta', 'tool-beta'),
    d('include:tool-alpha', 'tool-alpha'),
  ])
  expect(tools.map(t => t.id)).toEqual(['tool-alpha', 'tool-beta', 'tool-zeta'])
})

it('计数分四档', () => {
  const tools = buildToolPlugins([
    d('include:tool-a', 'tool-a'),
    d('include:tool-b', 'tool-b', { state: 'disabled', disabled: true }),
    d('include:tool-c', 'tool-c', { state: 'disabled', disabled: true }),
    d('include:agent-presets:tool-c', 'tool-c'),
  ])
  expect(countTools(tools)).toEqual({ total: 3, enabled: 2, disabled: 1, split: 1 })
})

it('嵌套树里的 entry 也能收到', () => {
  const tools = buildToolPlugins([
    d('include', 'include', { group: true, children: [
      d('include:agent-presets', 'agent-presets', { group: true, children: [d('include:agent-presets:tool-fs', 'tool-fs')] }),
    ] }),
  ])
  expect(tools.map(t => t.id)).toEqual(['tool-fs'])
})
