/**
 * 把构建期编好的 Tailwind 产物注入页面：带 data-plugin 标记的 <style>，按 tagId 幂等
 * （HMR 重载会再执行模块，不查重会堆重复标签）。
 */
import css from 'virtual:tailwind-css'

/** 构建期由 tsdown 注入的包名（见 tsdown.config.ts 的 define）。 */
declare const __PLUGIN_ID__: string

const PLUGIN = __PLUGIN_ID__
const TAG_ID = `${PLUGIN}/tailwind.css`

export function installStyles(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(TAG_ID)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset['plugin'] = PLUGIN
  tag.dataset['pluginCss'] = TAG_ID
  tag.textContent = css
  document.head.appendChild(tag)
}
