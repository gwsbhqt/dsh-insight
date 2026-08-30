/**
 * 图片后处理：把 2x 原图缩到 README 用得起的尺寸并压一遍。
 *
 * 为什么不直接用 2x 原图：3300px 宽、每张 500KB，六张就是 3MB——克隆仓库、
 * 打开 README 都要为此付费，而 GitHub 正文最宽也就 900 多 px。
 * 缩到 1800 宽（仍是 2x 视网膜余量）体积掉一半，肉眼看不出差别。
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'docs/assets/raw'
const OUT = 'docs/assets'
const MAX_WIDTH = 1800

mkdirSync(OUT, { recursive: true })
const py = `
import sys
from PIL import Image
src, dst, maxw = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB')
if im.width > maxw:
    im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
im.save(dst, 'PNG', optimize=True)
print(im.size)
`
for (const file of readdirSync(SRC).filter(f => f.endsWith('.png'))) {
  const src = join(SRC, file)
  const dst = join(OUT, file)
  const size = execFileSync('python3', ['-c', py, src, dst, String(MAX_WIDTH)]).toString().trim()
  const before = (statSync(src).size / 1024).toFixed(0)
  const after = (statSync(dst).size / 1024).toFixed(0)
  console.log(`${file.padEnd(16)} ${size.padEnd(14)} ${before}KB → ${after}KB`)
}
