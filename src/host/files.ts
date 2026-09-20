/**
 * 配置文件清单：当前 profile 涉及的 patch 层、settings、credentials 元数据、root cordis.yml。
 * credentials 的正文永不读取，也不进入预览 allowlist。
 */
import { open, realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-app-boot'
import type { ConfigFileInfo } from '../shared/types.ts'
import type { PatchLayer } from './layers.ts'

async function fileInfo(path: string, layer: string, role: ConfigFileInfo['role']): Promise<ConfigFileInfo | undefined> {
  try {
    const s = await stat(path)
    if (!s.isFile()) return undefined
    return { path, layer, role, size: s.size, mtimeMs: s.mtimeMs, previewable: role !== 'credentials' }
  } catch {
    return undefined // 文件不存在 = 该层缺席，不是错误
  }
}

async function credentialsInfo(path: string): Promise<ConfigFileInfo | undefined> {
  return fileInfo(path, 'credentials', 'credentials')
}

/**
 * 从 Harness home 直接采集（可测形态）。
 * @param home - $DSH_HOME。
 * @param profileName - profile 名。
 * @param layers - rebuildLayers 的分层（bundle 层带 patchPath）。
 */
export async function collectFilesFromHome(
  home: string, profileName: string, layers: PatchLayer[],
): Promise<ConfigFileInfo[]> {
  const profileDir = join(home, 'profiles', profileName)
  const entries = await Promise.all([
    ...layers.map(l => l.patchPath === undefined
      ? Promise.resolve(undefined)
      : fileInfo(l.patchPath, l.kind === 'bundle' ? `bundle:${l.label}` : l.kind, 'patch')),
    fileInfo(join(profileDir, 'cordis.yml'), 'root', 'root-config'),
    fileInfo(join(home, 'settings.yaml'), 'settings', 'settings'),
    credentialsInfo(join(home, '.credentials.yaml')),
  ])
  return entries.filter((e): e is ConfigFileInfo => e !== undefined)
}

/** $DSH_HOME：boot 提供的 `dshHomePath` 优先，其次环境变量，最后默认位置。 */
export function homeOf(ctx: Context): string {
  return ctx.dshHomePath?.() ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
}

/** 运行时形态：home 取 ctx.dshHomePath（boot 提供），profile 名按 home 反推。 */
export async function collectFiles(ctx: Context, layers: PatchLayer[]): Promise<ConfigFileInfo[]> {
  const home = homeOf(ctx)
  return collectFilesFromHome(home, profileNameOf(ctx, home), layers)
}

/**
 * 当前 profile 的名字。
 *
 * `ctx.baseUrl` 是**这一层 loader 的根**，不一定就是 profile 目录。市场热挂载进来的插件
 * 跑在它自己那一层里，baseUrl 指向 `<profile>/.dsh-market/`——照「取末段」的老办法算出来
 * 就是 `.dsh-market`，随后 loadProfile 报 `profile ".dsh-market" does not exist`，
 * 整个面板加载失败。**从市场装的插件走的正是这条路**，所以这不是边角情况。
 *
 * 判据改成「它落在 `<home>/profiles/` 下面的哪一段」：热挂载目录、node_modules 再深也
 * 一样能还原出 profile 名。落在 profiles 之外（非常规布局）才退回末段，认不出就当 web。
 * @param ctx - 客户端 / 宿主 ctx，取 `baseUrl`。
 * @param home - $DSH_HOME，默认现算。
 */
export function profileNameOf(ctx: Context, home: string = homeOf(ctx)): string {
  const base = ctx.baseUrl ?? ''
  let pathname: string
  try {
    pathname = base.startsWith('file:') ? fileURLToPath(base) : new URL(base).pathname
  } catch {
    return 'web'
  }
  const trimmed = pathname.replace(/[\\/]+$/u, '')
  const rel = relative(join(home, 'profiles'), trimmed)
  if (rel !== '' && !rel.startsWith('..') && !isAbsolute(rel)) {
    const first = rel.split(/[\\/]/u)[0]
    if (first !== undefined && first !== '') return first
  }
  return trimmed.split(/[\\/]/u).pop() ?? 'web'
}

const PREVIEW_MAX_BYTES = 256 * 1024

export interface FilePreview {
  content: string
  truncated: boolean
}

/** 将路径解析到真实文件，并要求它属于 Host 给出的允许集合。 */
export async function assertAllowedPath(path: string, allowedPaths: Iterable<string>): Promise<string> {
  if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`)
  const resolved = await realpath(path)
  const allowed = new Set<string>()
  for (const candidate of allowedPaths) {
    try {
      allowed.add(await realpath(candidate))
    } catch {
      // 已消失的候选项不进入 allowlist。
    }
  }
  if (!allowed.has(resolved)) throw new Error('该路径不在 Insight 可访问范围内')
  return resolved
}

/**
 * 预览授权必须同时满足 Host 已发现且该角色允许读取正文。
 * @param path - 请求预览的路径。
 * @param files - 分层清单里的配置文件（credentials 那类 previewable 为 false，天然被挡在外面）。
 * @param extra - 不走分层清单、但同样是纯文本配置的路径（如预设的两个文件）。
 */
export function authorizePreviewPath(path: string, files: ConfigFileInfo[], extra: Iterable<string> = []): Promise<string> {
  return assertAllowedPath(path, [...files.filter(file => file.previewable).map(file => file.path), ...extra])
}

/** 预览用读文件：只从文件句柄读取前 256 KiB，不把大文件整体载入内存。 */
export async function readFilePreview(path: string): Promise<FilePreview> {
  if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`)
  const handle = await open(path, 'r')
  try {
    const st = await handle.stat()
    if (!st.isFile()) throw new Error(`不是普通文件，无法预览：${path}`)
    const maxRead = Math.min(st.size, PREVIEW_MAX_BYTES + 4)
    const buffer = Buffer.allocUnsafe(maxRead)
    const { bytesRead } = await handle.read(buffer, 0, maxRead, 0)
    const truncated = st.size > PREVIEW_MAX_BYTES
    const slice = buffer.subarray(0, Math.min(bytesRead, PREVIEW_MAX_BYTES))
    // TextDecoder 会把被截断的半个 UTF-8 字符替换成 U+FFFD；去掉尾部替换字符即可保持预览整洁。
    const content = new TextDecoder('utf-8').decode(slice).replace(/\uFFFD+$/, '')
    return { content, truncated }
  } finally {
    await handle.close()
  }
}
