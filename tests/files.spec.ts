/** collectFiles：fixture DSH_HOME 上的文件清单采集。 */
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { realpath } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { collectFilesFromHome, assertAllowedPath, authorizePreviewPath, readFilePreview } from '../src/host/files.ts'

it('列出 patch 层、settings、credentials，按层归属标注', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-'))
  const profileDir = join(home, 'profiles', 'insight')
  mkdirSync(profileDir, { recursive: true })
  writeFileSync(join(profileDir, 'cordis.yml'), '[]\n')
  writeFileSync(join(profileDir, 'cordis.patch.yml'), '- id: x\n  disabled: true\n')
  writeFileSync(join(home, 'cordis.patch.yml'), '- id: y\n  disabled: true\n')
  writeFileSync(join(home, 'settings.yaml'), 'llm:\n  model: foo\n')
  writeFileSync(join(home, '.credentials.yaml'), 'DEEPSEEK_API_KEY: sk-secret\nOTHER: x\n')

  const files = await collectFilesFromHome(home, 'insight', [
    { kind: 'profile', label: 'profile', patchPath: join(profileDir, 'cordis.patch.yml'), patches: [] },
    { kind: 'home', label: '$DSH_HOME', patchPath: join(home, 'cordis.patch.yml'), patches: [] },
  ])
  const byRole = Object.groupBy(files, f => f.role)
  expect(byRole['patch']?.map(f => f.layer).sort()).toEqual(['home', 'profile'])
  expect(byRole['settings']?.[0]?.path).toBe(join(home, 'settings.yaml'))
  // credentials 只列出文件存在性，正文不可通过 Insight 预览
  expect(byRole['credentials']?.length).toBe(1)
  expect(byRole['credentials']?.[0]?.previewable).toBe(false)
  expect(byRole['settings']?.[0]?.previewable).toBe(true)
  // 值永不出现：清单里任何字段都不含密钥文本
  expect(JSON.stringify(files)).not.toContain('sk-secret')
  expect(byRole['root-config']?.[0]?.path).toBe(join(profileDir, 'cordis.yml'))
})

it('只允许 allowlist 中的真实路径', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-access-'))
  const allowed = join(home, 'settings.yaml')
  const denied = join(home, 'secret.txt')
  writeFileSync(allowed, 'ok: true\n')
  writeFileSync(denied, 'secret\n')
  // macOS 的 /var → /private/var 符号链接：返回值是规范化后的真实路径
  await expect(assertAllowedPath(allowed, [allowed])).resolves.toBe(await realpath(allowed))
  await expect(assertAllowedPath(denied, [allowed])).rejects.toThrow('不在 Insight 可访问范围')
})

it('credentials 即使出现在文件清单中也不能获得预览授权', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-credentials-'))
  const credentials = join(home, '.credentials.yaml')
  writeFileSync(credentials, 'TOKEN: secret\n')
  await expect(authorizePreviewPath(credentials, [{
    path: credentials,
    layer: 'credentials',
    role: 'credentials',
    size: 14,
    mtimeMs: 0,
    previewable: false,
  }])).rejects.toThrow('不在 Insight 可访问范围')
})

it('大文件只读取前 256 KiB，并保持 UTF-8 尾部完整', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-insight-preview-'))
  const file = join(home, 'large.yaml')
  writeFileSync(file, `${'a'.repeat(256 * 1024 - 1)}中tail`)
  const preview = await readFilePreview(file)
  expect(preview.truncated).toBe(true)
  expect(Buffer.byteLength(preview.content)).toBeLessThanOrEqual(256 * 1024)
  expect(preview.content.endsWith('\uFFFD')).toBe(false)
})
