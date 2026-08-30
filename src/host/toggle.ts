/**
 * 在 profile 的补丁层里禁用 / 启用一个插件。
 *
 * **这是这个插件唯一的写路径。** 面板的其余部分严格只读，所以这里的每一条约束都是
 * 明写出来的，而不是靠「小心一点」：
 *
 *   1. **只写 profile 补丁层那一个文件**（`$DSH_HOME/profiles/<name>/cordis.patch.yml`）。
 *      bundle 层在 node_modules 里，那是包管理器的地盘；home 层是跨 profile 的公共层。
 *      两者都不碰——写错地方比写错内容更难收拾。
 *   2. **逐行改文本，绝不重新序列化 YAML。** 用 js-yaml 读进来再 dump 出去，语法是对的，
 *      但用户那一整份注释会被抹掉——而补丁文件里的注释恰恰是「为什么关掉它」的唯一记录。
 *      所以这里只动该动的那一行，其余字节原样保留。
 *   3. **短 id 撞名就拒绝。** 补丁按 id 命中，同一个短 id 在运行时有两份时，写下去会同时
 *      命中两个。这一轴一贯的态度是不猜，写操作更没有猜的余地。
 *   4. **原子落盘**：先写同目录的临时文件再 rename，中途断电不会留下半份配置。
 */
import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join, relative, isAbsolute } from 'node:path'
import type { ToggleResult } from '../shared/types.ts'

/** 新插入的那一段上面写这一行，好让人知道它是谁加的、怎么改回去。 */
export const TOGGLE_COMMENT = '# 「洞察」面板加的：在面板里点禁用/启用会改下面这一行'

/** 允许写进 YAML 的 id 形状。补丁按 id 命中，它不该带引号、换行或注释符。 */
const SAFE_ID = /^[A-Za-z0-9_.:-]+$/u

/** 一个顶层列表项占的行区间 `[start, end)`。 */
interface Block {
  start: number
  end: number
}

/** 顶层列表项：以 `- ` 开头且不缩进的行开启一段，直到下一段或文件结束。 */
export function topLevelBlocks(lines: readonly string[]): Block[] {
  const blocks: Block[] = []
  for (const [i, line] of lines.entries()) {
    if (!/^-(\s|$)/u.test(line)) continue
    const last = blocks.at(-1)
    if (last !== undefined) last.end = i
    blocks.push({ start: i, end: lines.length })
  }
  return blocks
}

/** 去掉 YAML 标量外面的引号。 */
function unquote(value: string): string {
  const trimmed = value.trim()
  const quoted = /^(['"])(.*)\1$/u.exec(trimmed)
  return quoted?.[2] ?? trimmed
}

/**
 * 一段里 `id:` 那一行的行号与值。
 * 首行写成 `- id: x` 是常规写法；`- name: x` 后面另起一行写 `id:` 也认。
 */
export function idLineOf(lines: readonly string[], block: Block): { line: number; id: string } | undefined {
  const head = /^-\s+id:\s*(.*)$/u.exec(lines[block.start] ?? '')
  if (head !== null) return { line: block.start, id: unquote(head[1] ?? '') }
  for (let i = block.start; i < block.end; i += 1) {
    const key = /^\s+id:\s*(.*)$/u.exec(lines[i] ?? '')
    if (key !== null) return { line: i, id: unquote(key[1] ?? '') }
  }
  return undefined
}

/** 一段里键的缩进（`- id: x` 的 `id` 落在第 2 列）。取块内第一条缩进键的实际缩进。 */
function keyIndent(lines: readonly string[], block: Block): string {
  for (let i = block.start + 1; i < block.end; i += 1) {
    const indent = /^(\s+)\S/u.exec(lines[i] ?? '')
    if (indent !== null) return indent[1] ?? '  '
  }
  return '  '
}

/** 一段里顶层 `disabled:` 那一行（嵌在 config 里更深的同名键不算）。 */
export function disabledLineOf(lines: readonly string[], block: Block): number | undefined {
  const indent = keyIndent(lines, block)
  const head = /^-\s+disabled:\s/u.test(lines[block.start] ?? '')
  if (head) return block.start
  for (let i = block.start + 1; i < block.end; i += 1) {
    if (lines[i] === `${indent}disabled:` || (lines[i] ?? '').startsWith(`${indent}disabled: `)) return i
  }
  return undefined
}

/** 改写结果：新文本 + 这次到底做了什么。 */
export interface Rewrite {
  text: string
  action: 'inserted' | 'updated' | 'removed' | 'unchanged'
}

/**
 * 这一段是不是「只有一条 disabled、且没人给它写过说明」——只有这种才允许整段删掉。
 *
 * 两个条件缺一不可。body 只有 disabled：说明这一段的全部内容就是这个开关，
 * 删掉它不会带走别的配置。上面没有别人的注释：注释是写给这一段的，
 * 段没了注释就成了指向空气的一句话——**宁可留一行废配置，也不孤立别人写的解释**。
 * 我们自己那行 TOGGLE_COMMENT 例外，它本来就是跟着这一段一起写的。
 */
function removable(lines: readonly string[], block: Block): boolean {
  const idLine = idLineOf(lines, block)?.line ?? block.start
  for (let i = block.start; i < block.end; i += 1) {
    if (i === idLine || (lines[i] ?? '').trim() === '') continue
    if (!/^\s*-?\s*disabled:\s/u.test(lines[i] ?? '')) return false
  }
  const above = (lines[block.start - 1] ?? '').trim()
  return above === '' || above === TOGGLE_COMMENT || block.start === 0
}

/**
 * 把「id 的 disabled 设成某个值」落到文本上。
 *
 * 三条路径：已有这一段且已有 disabled 行 → 只改那一行；已有这一段但没有 disabled 行 →
 * 在 id 那一行后面插一行；这一段根本不存在 → 末尾追加一段，并在上面留一行注释。
 * 还有第四条路径：目标状态和**不写这一行时的状态**一样，那这一行就是废话。
 * 这时不是把它改成 `disabled: false` 留在那儿，而是删掉——补丁层是「你对默认做了什么」
 * 的清单，一条什么都没做的记录只会让下次读它的人多花时间确认它没做什么。
 * @param text - 补丁文件现有的全部文本（文件不存在时传空串）。
 * @param id - 要命中的 entry id。
 * @param disabled - 目标状态。
 * @param redundant - 不写这一行的话，效果是不是就等于目标状态。true 则走删除路径。
 */
export function rewritePatch(text: string, id: string, disabled: boolean, redundant = false): Rewrite {
  const value = disabled ? 'true' : 'false'
  // 保留原文件的换行风格：整份文件里出现过 \r\n 就跟着用
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const lines = text.split(/\r?\n/u)
  const blocks = topLevelBlocks(lines)
  const hit = blocks.find(b => idLineOf(lines, b)?.id === id)

  if (redundant) {
    // 本来就没有这一段：目标状态跟不写它一样，那就真的别写——
    // 追加一段 `disabled: false` 等于往补丁层里塞一条「我什么都没做」的记录
    if (hit === undefined) return { text, action: 'unchanged' }
    const at = disabledLineOf(lines, hit)
    if (at === undefined) return { text, action: 'unchanged' } // 段在、但本来就没写过这一行
    if (!removable(lines, hit)) {
      // 段里还有别的配置，或者上面挂着别人写的注释：只摘掉开关那一行，其余原样留着
      const copy = [...lines]
      copy.splice(at, 1)
      return { text: copy.join(eol), action: 'removed' }
    }
    // 整段连同我们自己那行注释一起摘掉，并收掉留下的那个空行
    const above = (lines[hit.start - 1] ?? '').trim()
    const from = above === TOGGLE_COMMENT ? hit.start - 1 : hit.start
    const copy = [...lines]
    copy.splice(from, hit.end - from)
    // 删完如果留下连着的两个空行，收掉一个——补丁文件是给人读的
    if ((copy[from - 1] ?? '').trim() === '' && (copy[from] ?? '').trim() === '') copy.splice(from, 1)
    return { text: copy.join(eol), action: 'removed' }
  }

  if (hit !== undefined) {
    const at = disabledLineOf(lines, hit)
    if (at !== undefined) {
      const indent = /^(\s*-?\s*)/u.exec(lines[at] ?? '')?.[1] ?? '  '
      const next = `${indent}disabled: ${value}`
      if (lines[at] === next) return { text, action: 'unchanged' }
      const copy = [...lines]
      copy[at] = next
      return { text: copy.join(eol), action: 'updated' }
    }
    const idLine = idLineOf(lines, hit)
    const copy = [...lines]
    copy.splice((idLine?.line ?? hit.start) + 1, 0, `${keyIndent(lines, hit)}disabled: ${value}`)
    return { text: copy.join(eol), action: 'updated' }
  }

  // 追加一段。前面垫一个空行让它和上一段分开，但文件本来就是空的时候不垫。
  const body = [TOGGLE_COMMENT, `- id: ${id}`, `  disabled: ${value}`].join(eol)
  const base = text.replace(/\s*$/u, '')
  const head = base === '' ? '' : `${base}${eol}${eol}`
  return { text: `${head}${body}${eol}`, action: 'inserted' }
}

/** 目标文件必须落在 $DSH_HOME 里，且不许在 node_modules 里。 */
export function writableTarget(path: string, home: string): boolean {
  if (!isAbsolute(path) || /[\\/]node_modules[\\/]/u.test(path)) return false
  const rel = relative(home, path)
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)
}

/** 原子落盘：同目录临时文件 + rename，中途断电不会留下半份配置。 */
export async function writeAtomic(path: string, text: string): Promise<void> {
  const tmp = join(dirname(path), `.${String(process.pid)}-${String(Date.now())}.dsh-insight.tmp`)
  try {
    await writeFile(tmp, text, 'utf8')
    await rename(tmp, path)
  } catch (error) {
    await unlink(tmp).catch(() => { /* 临时文件没建起来就没什么可删的 */ })
    throw error
  }
}

/**
 * 在补丁文件上执行一次禁用 / 启用。
 * @param opts.path - profile 补丁文件的绝对路径。
 * @param opts.home - $DSH_HOME，用来确认写的地方没跑偏。
 * @param opts.id - 要命中的 entry id（短 id）。
 * @param opts.disabled - 目标状态。
 * @param opts.matches - **重放出来的配置**里这个 id 有几份：0 = 补丁命不中，>1 = 真撞名。
 *   判据是配置而不是运行时，理由见 rpc.ts 里 config/toggle 那一段。
 * @param opts.redundant - 不写这一行的话效果就等于目标状态——那就删掉它，别留一行废话。
 */
export async function applyToggle(opts: {
  path: string
  home: string
  id: string
  disabled: boolean
  matches: number
  redundant?: boolean
}): Promise<ToggleResult> {
  if (!SAFE_ID.test(opts.id)) {
    return { ok: false, reason: 'refused', message: `id 形状不合法：${opts.id}` }
  }
  if (opts.matches === 0) {
    return { ok: false, reason: 'not-found', message: `配置里没有 ${opts.id} 这一条（运行时注册的插件就是这样），按 id 写补丁命不中它` }
  }
  if (opts.matches > 1) {
    return {
      ok: false,
      reason: 'ambiguous',
      message: `配置里有 ${String(opts.matches)} 条都叫 ${opts.id}，按 id 写下去会同时命中它们`,
    }
  }
  if (!writableTarget(opts.path, opts.home)) {
    return { ok: false, reason: 'refused', message: `只写 $DSH_HOME 里的 profile 补丁层，不写 ${opts.path}` }
  }
  let text = ''
  try {
    text = await readFile(opts.path, 'utf8')
  } catch {
    text = '' // 补丁文件还不存在：这次就把它建出来
  }
  const { text: next, action } = rewritePatch(text, opts.id, opts.disabled, opts.redundant === true)
  if (action !== 'unchanged') {
    try {
      await writeAtomic(opts.path, next)
    } catch (error) {
      return { ok: false, reason: 'failed', message: error instanceof Error ? error.message : String(error) }
    }
  }
  return { ok: true, path: opts.path, action, disabled: opts.disabled }
}
