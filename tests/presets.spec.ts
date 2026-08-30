/**
 * 按预设这一轴的 host 半：composition 怎么解析、出处怎么判、会话实况怎么算。
 *
 * 最要命的两条各有一个用例钉着：
 *   `!!js` 表达式不许被当成真——`Boolean({__jsExpr})` 恒为 true，静态侧判不了；
 *   「读不到会话实况」不许说成「没人用」。
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { collectPresets, presetPaths, readComposition } from '../src/host/presets.ts'
import { vendorOfPath } from '../src/shared/vendor.ts'
import type { PresetInventory } from '../src/shared/types.ts'

const dirs: string[] = []
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

/** 造一个预设 root，返回它的路径。 */
function makeRoot(presets: Record<string, { composition: string; meta?: string }>): string {
  const root = mkdtempSync(join(tmpdir(), 'dsh-insight-presets-'))
  dirs.push(root)
  for (const [id, files] of Object.entries(presets)) {
    const dir = join(root, id)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'agent.cordis.yml'), files.composition)
    if (files.meta !== undefined) writeFileSync(join(dir, 'preset.yml'), files.meta)
  }
  return root
}

const COMPOSITION = `
- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: hello

- id: shell
  name: cordis:group
  group: true
  isolate:
    terminals: true
  config:
    - id: bash
      name: '@deepseek-ai/dsh-tool-bash'
      disabled: !!js process.platform === 'win32'
    - id: pwsh
      name: '@deepseek-ai/dsh-tool-pwsh'
      disabled: true
`

describe('composition 解析', () => {
  it('容器行、私有 realm、以及不许求值的 !!js 开关', async () => {
    const root = makeRoot({ demo: { composition: COMPOSITION } })
    const { rows, rowsError } = await readComposition(join(root, 'demo', 'agent.cordis.yml'))
    expect(rowsError).toBeUndefined()
    expect(rows).toBeDefined()
    const [persona, shell] = rows ?? []
    expect(persona).toMatchObject({ id: 'persona', name: '@deepseek-ai/dsh-persona', group: false, disabled: false })
    expect(persona?.config).toEqual({ text: 'hello' })

    expect(shell).toMatchObject({ id: 'shell', group: true, isolate: ['terminals'] })
    // 容器行的 config 是子行，不该当成它自己的配置
    expect(shell?.config).toBeUndefined()

    const [bash, pwsh] = shell?.children ?? []
    // 关键：表达式开关静态侧一律 disabled=false，真值留给 disabledExpr 说明
    expect(bash).toMatchObject({ disabled: false, disabledExpr: "process.platform === 'win32'" })
    // 写死 true 的才算真的关了
    expect(pwsh).toMatchObject({ disabled: true })
    expect(pwsh?.disabledExpr).toBeUndefined()
  })

  it('文件读不出来时带回原因，不抛——一个坏预设不该拖垮整张清单', async () => {
    const { rows, rowsError } = await readComposition(join(tmpdir(), 'dsh-insight-nope', 'agent.cordis.yml'))
    expect(rows).toBeUndefined()
    expect(rowsError).toBeTruthy()
  })

  it('顶层不是列表就直说', async () => {
    const root = makeRoot({ demo: { composition: 'id: 不是列表\n' } })
    const { rowsError } = await readComposition(join(root, 'demo', 'agent.cordis.yml'))
    expect(rowsError).toContain('列表')
  })
})

describe('出处按磁盘位置判', () => {
  it('官方 scope / 三方包 / 本地目录三档，并说出是哪个包', () => {
    expect(vendorOfPath('/x/node_modules/@deepseek-ai/dsh/config/agent-presets'))
      .toEqual({ vendor: 'official', pkg: '@deepseek-ai/dsh' })
    expect(vendorOfPath('/x/node_modules/some-market-plugin/presets'))
      .toEqual({ vendor: 'third-party', pkg: 'some-market-plugin' })
    // 不在 node_modules 里 = 你自己写的
    expect(vendorOfPath('/Users/me/.dsh/.agent-presets')).toEqual({ vendor: 'local' })
    // 嵌套时最后一段才是真正拥有这个目录的包
    expect(vendorOfPath('/a/node_modules/outer/node_modules/inner/presets'))
      .toEqual({ vendor: 'third-party', pkg: 'inner' })
  })
})

/**
 * agentPresets 服务的替身：只实现面板真正读的那几样。
 *
 * `name`/`description`/`order` 是**上游**读 preset.yml 填好的（它自己解析那份文件），
 * 面板只是原样透传——所以替身也从这里给，不是面板自己去读。面板自己判的是
 * 「preset.yml 这个文件在不在」（metaPath），那一条另有断言。
 */
function fakeCtx(opts: {
  root: string
  ids: string[]
  defaultId?: string
  names?: Record<string, string>
  agents?: { session: unknown }[]
  declaredRoots?: { path: string; trust: string }[]
}) {
  const service = {
    defaultId: opts.defaultId,
    config: { roots: opts.declaredRoots },
    list: () => Promise.resolve(opts.ids.map(id => ({
      id,
      trust: 'user' as const,
      path: join(opts.root, id, 'agent.cordis.yml'),
      ...(opts.names?.[id] === undefined ? {} : { name: opts.names[id] }),
    }))),
  }
  const agents = opts.agents === undefined ? undefined : { list: () => opts.agents }
  return {
    get: (name: string) => (name === 'agentPresets' ? service : name === 'agents' ? agents : undefined),
  } as never
}

/** 一个会话：header 记创建时选的，events 记后来换的。 */
const session = (header?: string, ...selected: string[]) => ({
  header: header === undefined ? {} : { agentPreset: header },
  events: selected.map(id => ({ type: 'agent-preset/selected', data: { agentPreset: id } })),
})

describe('清单采集', () => {
  it('数出预设、认出默认、把 root 归并成一条', async () => {
    const root = makeRoot({
      a: { composition: COMPOSITION, meta: 'name: 甲\norder: 1\n' },
      b: { composition: COMPOSITION },
    })
    const inv: PresetInventory = await collectPresets(fakeCtx({ root, ids: ['a', 'b'], defaultId: 'b', names: { a: '甲' } }))
    expect(inv.presets).toHaveLength(2)
    expect(inv.defaultId).toBe('b')
    expect(inv.presets.find(p => p.id === 'b')?.isDefault).toBe(true)
    const a = inv.presets.find(p => p.id === 'a')
    expect(a?.name).toBe('甲')
    expect(a?.metaPath).toBeDefined()
    // 非容器行才算插件：persona + bash + pwsh = 3，容器行 shell 不算
    expect(a?.plugins).toBe(3)
    // 没有 preset.yml 的那个不该凭空长出一个 metaPath
    expect(inv.presets.find(p => p.id === 'b')?.metaPath).toBeUndefined()
    // 两个预设同一个 root，只出一条
    expect(inv.roots).toHaveLength(1)
    expect(inv.roots[0]).toMatchObject({ path: root, count: 2, vendor: 'local' })
  })

  it('配置里带尾部斜杠的 root 不该变成第二条空目录', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION } })
    const inv = await collectPresets(fakeCtx({
      root, ids: ['a'],
      declaredRoots: [{ path: `${root}/`, trust: 'user' }],
    }))
    expect(inv.roots).toHaveLength(1)
    expect(inv.roots[0]?.count).toBe(1)
  })

  it('声明了却一个预设都没供出来的 root 仍然列出来，count 是 0', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION } })
    const inv = await collectPresets(fakeCtx({
      root, ids: ['a'],
      declaredRoots: [{ path: '/somewhere/node_modules/market-pack/presets', trust: 'system' }],
    }))
    const empty = inv.roots.find(r => r.count === 0)
    expect(empty).toMatchObject({ vendor: 'third-party', pkg: 'market-pack', trust: 'system' })
  })

  it('会话数按上游 resolveSessionPreset 的规则算：最后一次切换赢', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION }, b: { composition: COMPOSITION } })
    const inv = await collectPresets(fakeCtx({
      root, ids: ['a', 'b'],
      agents: [
        { session: session('a') },            // 创建时选的 a，没换过
        { session: session('a', 'b') },       // 创建时 a，后来换成 b —— 只读 header 会数错
        { session: session(undefined) },      // 没有预设的会话，不计入任何一行
      ],
    }))
    expect(inv.sessionsKnown).toBe(true)
    expect(inv.presets.find(p => p.id === 'a')?.sessions).toBe(1)
    expect(inv.presets.find(p => p.id === 'b')?.sessions).toBe(1)
  })

  it('agents 服务缺席时不说「没人用」，而是说不知道', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION } })
    const inv = await collectPresets(fakeCtx({ root, ids: ['a'] }))
    expect(inv.sessionsKnown).toBe(false)
    expect(inv.presets[0]?.sessions).toBeUndefined()
  })

  it('服务缺席和「服务在但没预设」要分开报——空清单的成因不是一回事', async () => {
    // 没装 / 被关掉：该去「按插件」找那一条，不是去写一个预设
    const gone = await collectPresets({ get: () => undefined } as never)
    expect(gone).toEqual({ presets: [], roots: [], sessionsKnown: false, service: 'missing' })

    // 服务在、扫过了、确实一个都没有：这才是「去写一个」
    const root = mkdtempSync(join(tmpdir(), 'dsh-insight-presets-'))
    dirs.push(root)
    const empty = await collectPresets(fakeCtx({ root, ids: [] }))
    expect(empty.service).toBe('ok')
    expect(empty.presets).toEqual([])
  })
})

describe('预览白名单', () => {
  it('放行预设自己的两个文件、它的目录，以及扫出它的那个 root', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION, meta: 'name: 甲\n' } })
    const paths = await presetPaths(fakeCtx({ root, ids: ['a'] }))
    // root 也要在里面：详情里把它当路径显示，「在编辑器打开」就得按得动
    expect(paths.dirs).toEqual([join(root, 'a'), root])
    expect(paths.files).toEqual([join(root, 'a', 'agent.cordis.yml'), join(root, 'a', 'preset.yml')])
  })

  it('同一个 root 下多个预设，root 只出现一次', async () => {
    const root = makeRoot({ a: { composition: COMPOSITION }, b: { composition: COMPOSITION } })
    const paths = await presetPaths(fakeCtx({ root, ids: ['a', 'b'] }))
    expect(paths.dirs.filter(d => d === root)).toHaveLength(1)
  })

  it('列不出来就一个都不放行', async () => {
    const broken = { get: (n: string) => (n === 'agentPresets' ? { list: () => Promise.reject(new Error('boom')) } : undefined) } as never
    expect(await presetPaths(broken)).toEqual({ files: [], dirs: [] })
  })
})
