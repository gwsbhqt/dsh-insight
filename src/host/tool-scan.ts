/**
 * 工具名静态扫描：兜底路径。
 *
 * 运行时观察器（tool-observer.ts）只有在 agent 跑过之后才有数据——全新启动、
 * 还没聊过天时它是空的。这时退回扫插件自己的构建产物，把 `defineTool({ name: "x" })`
 * 里的字面量抠出来。
 *
 * 这是明确的 hack，界面上必须标注来源，不能和运行时观察到的混为一谈：
 *   - 依赖构建产物的形状。上游换打包方式、或某个插件改成 `name: NAMES.bash`，那条就静默消失。
 *   - 正则不是 AST，理论上会误报。
 *   - 拿不到运行时才决定的名字（subagent 家族、workflow 的 `name: toolName`）。
 * 实测覆盖：22 个工具插件里 15 个能抠出字面量（31 个工具），5 个是真动态，2 个没找到。
 *
 * 只读、只提取工具名，不返回文件内容——读的也都是用户已经在运行的代码。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { ObservedTool } from '../shared/types.ts'

/**
 * 只认 `defineTool({` 与 `tools.register({`。
 * 不能放宽成 `.register({`——那会把 slots.register / commands.register /
 * settings.section 全抓进来：实测放宽后 117 条里 85 条是假的（误报 89 → 5）。
 */
const ANCHOR = /(?:\bdefineTool\s*\(\s*\{|\btools\s*\.\s*register\s*\(\s*(?:defineTool\s*\(\s*)?\{)/g
const NAME = /\bname:\s*(?:"([A-Za-z_][\w.-]*)"|'([A-Za-z_][\w.-]*)')/

/** 单个包目录扫多深就够——插件产物都在 lib/ 下，别把整棵树翻遍。 */
const MAX_DEPTH = 3
const MAX_BYTES = 2 * 1024 * 1024

function jsFiles(dir: string, depth = 0): string[] {
  if (depth > MAX_DEPTH) return []
  let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: string[] = []
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const path = join(dir, e.name)
    if (e.isDirectory()) out.push(...jsFiles(path, depth + 1))
    else if (e.isFile() && e.name.endsWith('.js')) out.push(path)
  }
  return out
}

/** 扫一个插件包目录，返回它注册的工具名（字面量的那些）。 */
export function scanToolNames(packageDir: string): string[] {
  const names = new Set<string>()
  for (const file of jsFiles(packageDir)) {
    let src: string
    try {
      if (statSync(file).size > MAX_BYTES) continue
      src = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    ANCHOR.lastIndex = 0
    for (const m of src.matchAll(ANCHOR)) {
      const window = src.slice(m.index + m[0].length, m.index + m[0].length + 400)
      const nm = NAME.exec(window)
      if (nm !== null) names.add(nm[1] ?? nm[2]!)
    }
  }
  return [...names].sort()
}

/** 按包目录缓存：同一次进程里同一个包只扫一次。 */
const cache = new Map<string, ObservedTool[]>()

export function scannedTools(packageDir: string, pkg: string): ObservedTool[] {
  const hit = cache.get(packageDir)
  if (hit !== undefined) return hit
  const tools = scanToolNames(packageDir).map((name): ObservedTool => ({ name, source: 'scan', pkg }))
  cache.set(packageDir, tools)
  return tools
}
