/**
 * 构建产物契约守卫（思路抄 self-evolution tests/ui-plugins.spec.ts）：
 * 模块表形状、Tailwind 产物纪律、token 引用真实性。
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const PKG_NAME: string = JSON.parse(readFileSync('package.json', 'utf8')).name

const CLIENT = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
const TAILWIND_SRC = readFileSync(new URL('../src/client/tailwind.css', import.meta.url), 'utf8')

describe('client bundle 形状', () => {
  it('是模块表认识的 closure-factory 包装，id 等于包名', () => {
    // rolldown 会把 banner/footer 美化成多行，所以只锚关键片段而非整行
    expect(CLIENT).toContain('window.__ModuleLoader__.load({')
    // 断言「等于包名」而不是某个字面量：改名时这条要么跟着过，要么当场炸——
    // 模块表用包名做行键，两者不一致的话客户端半根本加载不上
    expect(CLIENT).toMatch(new RegExp(`id:\\s*${JSON.stringify(PKG_NAME)}`))
    expect(CLIENT).toMatch(/factory:\s*\(require\)\s*=>\s*\{/)
    expect(CLIENT).toContain('return module.exports;')
  })
})

describe('tailwind 纪律', () => {
  it('工具类不走 var(--color-) 间接层（@theme 少了 inline 的信号）', () => {
    // 判据抄 self-evolution tests/ui-plugins.spec.ts：:root 上的 --color-* 定义是死重，
    // 真正致命的是工具类引用 var(--color-)——它在 body 上解析不到房子的 token，颜色全黑。
    expect(CLIENT).toContain('var(--dsw-alias-')
    expect(CLIENT).not.toContain('var(--color-')
  })
  it('不引 preflight（全局 reset 会掀翻宿主样式）', () => {
    expect(TAILWIND_SRC).not.toMatch(/@import\s+["']tailwindcss\/preflight/)
    expect(TAILWIND_SRC).not.toContain('preflight.css')
  })
  it('只引用房子真实存在的 dsw token', () => {
    // 房子 token 全集见 dsh packages/client/ui-theme/src/styles/design-platform.css。
    // 这里钉住本包用到的最小集合，新增 token 时同步核对这个清单。
    const allowed = new Set([
      '--dsw-alias-label-primary', '--dsw-alias-label-secondary', '--dsw-alias-label-tertiary',
      '--dsw-alias-label-caption', '--dsw-alias-label-dimmed',
      '--dsw-alias-brand-primary',
      '--dsw-alias-state-success-primary', '--dsw-alias-state-error-primary', '--dsw-alias-state-warn-label',
      '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2',
      '--dsw-alias-border-l1', '--dsw-alias-border-l2',
      '--dsw-static-blue-500', // 淡蓝 hover 底色的 mix 基色（亮暗主题同值，静态色板）
      '--dsw-alias-interactive-bg-hover',
    ])
    const used = [...TAILWIND_SRC.matchAll(/var\((--dsw-[a-z0-9-]+)\)/g)].map(m => m[1]).filter((t): t is string => t !== undefined)
    expect(used.length).toBeGreaterThan(0)
    for (const token of used) expect(allowed.has(token), `未知 token ${token}`).toBe(true)
  })
})
