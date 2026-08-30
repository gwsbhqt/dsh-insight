/** settings/list 端点：describe 透传映射 + 服务缺席容错。 */
import { expect, it } from 'vitest'
import { createInsightHandler } from '../src/host/rpc.ts'
import type { SettingsView } from '../src/shared/types.ts'

function fakeCtx(settings: unknown) {
  return {
    get: (name: string) => (name === 'settings' ? settings : undefined),
  } as never
}

async function callList(ctx: never): Promise<SettingsView[]> {
  const handler = createInsightHandler(ctx)
  const result = await handler('settings/list', {}, new AbortController().signal)
  if (!result.ok) throw new Error(result.error.message)
  return result.value as SettingsView[]
}

it('describe 结果映射为 SettingsView（secret 路径点拼、base/user 透传）', async () => {
  const settings = {
    describe: (o: { redactSecrets: boolean }) => {
      expect(o.redactSecrets).toBe(true)
      return [
        { ns: 'llm', value: { model: 'K2' }, applies: 'live', secrets: [{ path: ['api', 'key'], set: true }] },
        { ns: 'web', value: { port: 3080 }, base: { port: 3080 }, user: { port: 3082 }, applies: 'restart', secrets: [] },
      ]
    },
  }
  const views = await callList(fakeCtx(settings))
  expect(views).toHaveLength(2)
  expect(views[0]).toEqual({ ns: 'llm', value: { model: 'K2' }, applies: 'live', secrets: [{ path: 'api.key', set: true }] })
  expect(views[0]).not.toHaveProperty('base')
  expect(views[1]).toMatchObject({ ns: 'web', base: { port: 3080 }, user: { port: 3082 }, applies: 'restart' })
})

it('settings 服务缺席返回空数组', async () => {
  expect(await callList(fakeCtx(undefined))).toEqual([])
})
