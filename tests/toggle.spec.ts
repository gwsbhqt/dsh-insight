/**
 * 唯一的写路径。这一份测试的重点不是「能不能写成」，而是**不该动的东西一个字节都没动**：
 * 用户补丁文件里全是注释，而注释正是「为什么关掉它」的唯一记录。
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  applyToggle,
  disabledLineOf,
  idLineOf,
  rewritePatch,
  topLevelBlocks,
  writableTarget,
  writeAtomic,
  TOGGLE_COMMENT,
} from '../src/host/toggle.ts'

const dirs: string[] = []
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

function makeHome(patch?: string): { home: string; path: string } {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-home-'))
  dirs.push(home)
  const path = join(home, 'cordis.patch.yml')
  if (patch !== undefined) writeFileSync(path, patch)
  return { home, path }
}

/** 抄自真实补丁文件的形状：注释比配置多，而且夹在中间。 */
const PATCH = `# Your patch layer for this dsh profile, applied after every bundle layer.

# 没配 DEEPSEEK_API_KEY，这条路由只是三个不可用的占位模型，整行禁用。
# 注意 $DSH_HOME 为 3080/3081 共用。
- id: llm-deepseek
  disabled: true

# 消息操作条里的点赞/点踩：UI 行与存储 sidecar 一起关掉。
- id: ui-message-feedback
  disabled: true

# dsh-ipython: per-session 持久 Python 内核。
- id: dsh-ipython
  config:
    pythonVersion: '3.13'
`

describe('文本解析', () => {
  const lines = PATCH.split('\n')
  it('顶层列表项按行区间切开，注释归给它下面那一段之外', () => {
    const blocks = topLevelBlocks(lines)
    expect(blocks).toHaveLength(3)
    expect(idLineOf(lines, blocks[0]!)?.id).toBe('llm-deepseek')
    expect(idLineOf(lines, blocks[2]!)?.id).toBe('dsh-ipython')
  })

  it('只认块自己那一层的 disabled，不认嵌在 config 里的同名键', () => {
    const nested = [
      '- id: a',
      '  config:',
      '    disabled: true',
    ]
    expect(disabledLineOf(nested, { start: 0, end: 3 })).toBeUndefined()
  })
})

describe('改写', () => {
  it('已有开关就只改那一行——注释一个字都不能少', () => {
    const { text, action } = rewritePatch(PATCH, 'llm-deepseek', false)
    expect(action).toBe('updated')
    expect(text).toContain('- id: llm-deepseek\n  disabled: false')
    // 三段注释原样还在
    expect(text).toContain('# 没配 DEEPSEEK_API_KEY，这条路由只是三个不可用的占位模型，整行禁用。')
    expect(text).toContain('# 消息操作条里的点赞/点踩：UI 行与存储 sidecar 一起关掉。')
    expect(text).toContain("    pythonVersion: '3.13'")
    // 除了那一行，逐行比对必须完全一致
    const before = PATCH.split('\n')
    const after = text.split('\n')
    expect(after).toHaveLength(before.length)
    const changed = before.flatMap((l, i) => (l === after[i] ? [] : [i]))
    expect(changed).toHaveLength(1)
  })

  it('已有这一段但没写过开关，就在 id 那一行后面插一行', () => {
    const { text, action } = rewritePatch(PATCH, 'dsh-ipython', true)
    expect(action).toBe('updated')
    expect(text).toContain('- id: dsh-ipython\n  disabled: true\n  config:')
    // 原有配置不受影响
    expect(text).toContain("    pythonVersion: '3.13'")
  })

  it('没有这一段就追加，并在上面留一行说明它是谁加的', () => {
    const { text, action } = rewritePatch(PATCH, 'ui-plan', true)
    expect(action).toBe('inserted')
    expect(text).toContain(`${TOGGLE_COMMENT}\n- id: ui-plan\n  disabled: true`)
    // 追加在末尾，前面的内容一字不动
    expect(text.startsWith(PATCH.replace(/\s*$/u, ''))).toBe(true)
  })

  it('目标状态和文件里写的一样就什么都不做', () => {
    const { text, action } = rewritePatch(PATCH, 'llm-deepseek', true)
    expect(action).toBe('unchanged')
    expect(text).toBe(PATCH)
  })

  it('空文件也能追加，且不在开头留空行', () => {
    const { text, action } = rewritePatch('', 'ui-plan', true)
    expect(action).toBe('inserted')
    expect(text).toBe(`${TOGGLE_COMMENT}\n- id: ui-plan\n  disabled: true\n`)
  })

  it('CRLF 文件保持 CRLF——换行风格也是不该被动的东西', () => {
    const crlf = '- id: a\r\n  disabled: true\r\n'
    const { text } = rewritePatch(crlf, 'b', true)
    expect(text).toContain('\r\n')
    expect(text.includes('\n\n')).toBe(false) // 没有混进裸 LF 造出来的空行
  })
})

describe('写哪里', () => {
  it('只认 $DSH_HOME 里的路径，node_modules 一律拒绝', () => {
    expect(writableTarget('/home/u/.dsh/profiles/web/cordis.patch.yml', '/home/u/.dsh')).toBe(true)
    expect(writableTarget('/home/u/elsewhere/cordis.patch.yml', '/home/u/.dsh')).toBe(false)
    // 包管理器的地盘：bundle 层在这里，写进去下次装包就没了，还会污染别人
    expect(writableTarget('/home/u/.dsh/node_modules/x/cordis.patch.yml', '/home/u/.dsh')).toBe(false)
    expect(writableTarget('relative/path.yml', '/home/u/.dsh')).toBe(false)
  })
})

describe('落盘', () => {
  it('原子写：内容完整落到目标路径，临时文件不留', async () => {
    const { home, path } = makeHome()
    await writeAtomic(path, 'hello\n')
    expect(readFileSync(path, 'utf8')).toBe('hello\n')
    const { readdirSync } = await import('node:fs')
    expect(readdirSync(home).filter(f => f.includes('tmp'))).toHaveLength(0)
  })
})

describe('整条链路', () => {
  const base = { disabled: true, matches: 1 }

  it('补丁文件还不存在时，这一次就把它建出来', async () => {
    const { home, path } = makeHome()
    const result = await applyToggle({ ...base, path, home, id: 'ui-plan' })
    expect(result).toMatchObject({ ok: true, action: 'inserted', disabled: true })
    expect(readFileSync(path, 'utf8')).toContain('- id: ui-plan')
  })

  it('撞名不写：按 id 写下去会同时命中两个', async () => {
    const { home, path } = makeHome(PATCH)
    const result = await applyToggle({ ...base, path, home, id: 'tool-bash', matches: 2 })
    expect(result).toMatchObject({ ok: false, reason: 'ambiguous' })
    expect(readFileSync(path, 'utf8')).toBe(PATCH) // 一个字节都没动
  })

  it('运行时没有这个插件就不写——不留一条永远命不中的补丁', async () => {
    const { home, path } = makeHome(PATCH)
    const result = await applyToggle({ ...base, path, home, id: 'nope', matches: 0 })
    expect(result).toMatchObject({ ok: false, reason: 'not-found' })
    expect(readFileSync(path, 'utf8')).toBe(PATCH)
  })

  it('id 形状不合法就不写：它要原样进 YAML', async () => {
    const { home, path } = makeHome(PATCH)
    for (const id of ['a b', 'a\n- id: evil', '#comment', '']) {
      expect(await applyToggle({ ...base, path, home, id })).toMatchObject({ ok: false, reason: 'refused' })
    }
    expect(readFileSync(path, 'utf8')).toBe(PATCH)
  })

  it('目标路径跑到 $DSH_HOME 外面就拒绝', async () => {
    const { path } = makeHome(PATCH)
    const result = await applyToggle({ ...base, path, home: '/somewhere/else', id: 'llm-deepseek' })
    expect(result).toMatchObject({ ok: false, reason: 'refused' })
    expect(readFileSync(path, 'utf8')).toBe(PATCH)
  })

  it('关掉再打开：来回切只改那一行，注释始终在', async () => {
    const { home, path } = makeHome(PATCH)
    await applyToggle({ ...base, path, home, id: 'llm-deepseek', disabled: false })
    let text = readFileSync(path, 'utf8')
    expect(text).toContain('- id: llm-deepseek\n  disabled: false')
    await applyToggle({ ...base, path, home, id: 'llm-deepseek', disabled: true })
    text = readFileSync(path, 'utf8')
    expect(text).toBe(PATCH) // 完整回到原样
  })
})

describe('冗余就删，而不是留一行废话', () => {
  it('面板自己加的那一段：撤回时连注释一起摘掉，前后不留空行堆积', () => {
    const added = `${PATCH}\n${TOGGLE_COMMENT}\n- id: session-title\n  disabled: true\n`
    const { text, action } = rewritePatch(added, 'session-title', false, true)
    expect(action).toBe('removed')
    expect(text).not.toContain('session-title')
    expect(text).not.toContain(TOGGLE_COMMENT)
    // 原有内容一字不动，且没有多出连着的空行
    expect(text.replace(/\n+$/u, '')).toBe(PATCH.replace(/\n+$/u, ''))
    expect(/\n\n\n/u.test(text)).toBe(false)
  })

  it('别人写了注释的那一段：只摘掉开关那一行，段和注释都留着', () => {
    // llm-deepseek 上面挂着两行解释「为什么关掉它」——段没了那两行就成了指向空气的话
    const { text, action } = rewritePatch(PATCH, 'llm-deepseek', false, true)
    expect(action).toBe('removed')
    expect(text).toContain('# 没配 DEEPSEEK_API_KEY，这条路由只是三个不可用的占位模型，整行禁用。')
    expect(text).toContain('- id: llm-deepseek')
    expect(text).not.toContain('  disabled: true\n\n# 消息操作条') // 那一行确实摘了
  })

  it('段里还有别的配置：只摘开关，配置留着', () => {
    const withBoth = '- id: dsh-ipython\n  disabled: true\n  config:\n    pythonVersion: \'3.13\'\n'
    const { text, action } = rewritePatch(withBoth, 'dsh-ipython', false, true)
    expect(action).toBe('removed')
    expect(text).toContain("    pythonVersion: '3.13'")
    expect(text).not.toContain('disabled:')
  })

  it('补丁里本来就没有这一段，就真的别写——不塞一条「我什么都没做」的记录', () => {
    const { text, action } = rewritePatch(PATCH, 'ui-plan', false, true)
    expect(action).toBe('unchanged')
    expect(text).toBe(PATCH)
  })

  it('段在、但本来就没写过开关那一行，也什么都不做', () => {
    const { text, action } = rewritePatch(PATCH, 'dsh-ipython', false, true)
    expect(action).toBe('unchanged')
    expect(text).toBe(PATCH)
  })

  it('整条链路：applyToggle 把 redundant 透传下去', async () => {
    const added = `${TOGGLE_COMMENT}\n- id: ui-plan\n  disabled: true\n`
    const { home, path } = makeHome(added)
    const result = await applyToggle({ path, home, id: 'ui-plan', disabled: false, matches: 1, redundant: true })
    expect(result).toMatchObject({ ok: true, action: 'removed' })
    expect(readFileSync(path, 'utf8').trim()).toBe('')
  })
})
