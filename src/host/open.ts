/** 用本地编辑器打开路径：优先 code（VS Code），缺席回退 zed。 */
import { spawn } from 'node:child_process'
import { isAbsolute } from 'node:path'

export interface OpenResult {
  editor: 'code' | 'zed'
}

function trySpawn(cmd: OpenResult['editor'], arg: string): Promise<boolean> {
  return new Promise(resolve => {
    const child = spawn(cmd, [arg], { stdio: 'ignore', detached: true })
    child.on('error', () => resolve(false))
    child.on('spawn', () => {
      child.unref()
      resolve(true)
    })
  })
}

export async function openInEditor(path: string): Promise<OpenResult> {
  if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`)
  if (await trySpawn('code', path)) return { editor: 'code' }
  if (await trySpawn('zed', path)) return { editor: 'zed' }
  throw new Error('未找到 code 或 zed 命令')
}
