/**
 * 插件树采集测试：用真 @deepseek-ai/cordis + loader 起一棵小树，
 * 断言 active/failed/pending 三态与 error 提取（对齐设计文档 §7）。
 */
import { pathToFileURL } from 'node:url'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { expect, it } from 'vitest'
import { buildTree, collectNodes, collectTree, type PluginNode } from '../src/host/tree.ts'

const fixture = (name: string) => pathToFileURL(join(__dirname, 'fixtures', name)).href

async function settle(loader: Loader): Promise<void> {
  // 失败的 entry 会让 await() 抛错；只要状态沉降，不看结果
  await Promise.allSettled(loader.getTasks())
}

it('真起小树：active/pending 两态 + create 失败即抛', async () => {
  const app = new Context()
  await app.plugin(Loader).await()
  // create 的 id 由 ensureId 生成，用返回值认领
  const okId = await app.loader.create({ name: fixture('ok-plugin.js') })
  const pendId = await app.loader.create({ name: fixture('ok-plugin.js'), inject: ['nonexistent-service'] })
  // create 路径的同步启动失败会抛错并摘除 entry（EntryGroup.create 的回滚）；
  // 真实 boot 里失败 entry 留存走的是 group 批量路径，FAILED 映射由下方 fake 单测覆盖。
  await expect(app.loader.create({ name: fixture('fail-plugin.js') })).rejects.toThrow('boom from fail-plugin')
  await settle(app.loader)

  const nodes = collectNodes(app as never)
  const byId = new Map(nodes.map(n => [n.id, n]))
  expect(byId.get(okId)?.state).toBe('active')
  expect(byId.get(pendId)?.state).toBe('pending')
  await app.loader.remove(okId)
})

it('FAILED fiber 提取 error（fake entry）', () => {
  const boom = new Error('boom')
  const fake = {
    loader: {
      *entries() {
        yield { id: 'bad', disabled: false, options: { name: 'pkg-bad' }, fiber: { state: 3, _error: boom } }
        // disabled 优先于 fiber：禁用条目不读 fiber 状态
        yield { id: 'off', disabled: true, options: { name: 'pkg-off' }, fiber: { state: 3, _error: boom } }
      },
    },
  }
  const nodes = collectNodes(fake)
  expect(nodes[0]).toMatchObject({ state: 'failed', error: { message: 'boom' } })
  expect(nodes[0]!.error?.stack).toBeDefined()
  expect(nodes[1]).toMatchObject({ state: 'disabled' })
  expect(nodes[1]!.error).toBeUndefined()
})

it('buildTree 按 id 前缀重建层级', () => {
  const leaf = (id: string): PluginNode => ({
    id, shortId: id.split(':').pop() ?? id, name: '', group: false,
    disabled: false, state: 'active', children: [],
  })
  const flat = [leaf('include'), leaf('include:a'), leaf('include:b'), leaf('solo'), leaf('include:a:x')]
  const roots = buildTree(flat)
  expect(roots.map(n => n.id)).toEqual(['include', 'solo'])
  const include = roots[0]!
  expect(include.children.map(n => n.id)).toEqual(['include:a', 'include:b'])
  expect(include.children[0]!.children.map(n => n.id)).toEqual(['include:a:x'])
})

it('originOf/resolvePath 注入来源与路径', () => {
  const fake = {
    loader: {
      *entries() {
        yield { id: 'a', disabled: false, options: { name: 'pkg-a' }, fiber: { state: 2 } }
        yield { id: 'b', disabled: true, options: { name: 'pkg-b' }, fiber: undefined }
      },
    },
  }
  const nodes = collectNodes(fake, {
    originOf: id => (id === 'a' ? 'bundle:@deepseek-ai/dsh-base' : undefined),
    resolvePath: name => `/x/${name}`,
  })
  expect(nodes[0]).toMatchObject({ state: 'active', origin: 'bundle:@deepseek-ai/dsh-base', path: '/x/pkg-a' })
  expect(nodes[1]).toMatchObject({ state: 'disabled' })
  expect(nodes[1]!.origin).toBeUndefined()
})

it('能力：provides 只算 impl.fiber 指向自己的 store 键；requires 取 inject 键', () => {
  const fiberA = { state: 2, inject: { connection: {} }, store: {} as Record<string, { fiber?: { entry?: unknown } }> }
  const entryA = { id: 'a', disabled: false, options: { name: 'pkg-a' }, fiber: fiberA }
  // settings 由自己 provide；events 由子 fiber（entry 指回 entryA）provide；loader 是注入的依赖
  fiberA.store = { settings: { fiber: fiberA as never }, events: { fiber: { entry: entryA } }, loader: { fiber: {} } }
  const fake = {
    loader: {
      *entries() {
        yield entryA
        // options.inject 数组形态（fiber 未起时回落）
        yield { id: 'b', disabled: false, options: { name: 'pkg-b', inject: ['loader'] }, fiber: undefined }
      },
    },
  }
  const nodes = collectNodes(fake)
  expect(nodes[0]?.provides).toEqual(['events', 'settings'])
  expect(nodes[0]?.requires).toEqual(['connection'])
  expect(nodes[1]?.requires).toEqual(['loader'])
  expect(nodes[1]?.provides).toBeUndefined()
})

it('未知 FiberState 不伪装成 pending，并保留原始状态码', () => {
  const fake = {
    loader: {
      *entries() {
        yield { id: 'future', disabled: false, options: { name: 'pkg-future' }, fiber: { state: 99 } }
      },
    },
  }
  expect(collectNodes(fake)[0]).toMatchObject({ state: 'unknown', rawState: 99 })
})

it('单条 entry 读取异常不拖垮整棵树', () => {
  const fake = {
    loader: {
      *entries() {
        yield { get id(): string { throw new Error('broken entry') } }
        yield { id: 'good', disabled: false, options: { name: 'pkg' }, fiber: { state: 2 } }
      },
    },
  }
  const nodes = collectNodes(fake)
  expect(nodes).toHaveLength(2)
  expect(nodes[0]).toMatchObject({ id: '(collect-error)', state: 'failed' })
  expect(nodes[1]).toMatchObject({ id: 'good', state: 'active' })
})
