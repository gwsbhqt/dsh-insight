/**
 * 截图工具：直连 CDP 抓 2x 高清图存盘。
 *
 * 为什么不用现成的截图 MCP：那类工具把图回传给调用方看，落不了盘；而且换不了
 * deviceScaleFactor，也没法按元素精确裁剪。README 里的图要能放大看清等宽字体，
 * 1x 的截图一放大就糊。
 *
 * 用法：node scripts/shoot.mjs <recipe.json>
 * recipe: { url, width, height, scale, out, shots: [{ name, script, clip? }] }
 *   reload  先重载页面并等 load（`location.reload()` 写在 script 里会把 eval 上下文
 *           连同那次调用一起干掉，只能走 Page.reload）
 *   script  在页面里跑的 async 函数体，返回值会打印出来（用来定位/断言）
 *   clip    CSS 选择器；不给就整屏。pad 给裁剪留出阴影的余量
 */
import { writeFileSync } from 'node:fs'
import { readFileSync } from 'node:fs'

const recipe = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const ENDPOINT = recipe.endpoint ?? 'http://127.0.0.1:9222'

/** recipe.open：另开一个标签页拍（拍本地 HTML 用），拍完关掉，不动用户的页面。 */
let page
let openedId
if (recipe.open) {
  const created = await (await fetch(`${ENDPOINT}/json/new?${encodeURIComponent(recipe.open)}`, { method: 'PUT' })).json()
  openedId = created.id
  await new Promise(r => setTimeout(r, 600))
  page = (await (await fetch(`${ENDPOINT}/json/list`)).json()).find(t => t.id === openedId)
} else {
  const targets = await (await fetch(`${ENDPOINT}/json/list`)).json()
  page = targets.find(t => t.type === 'page' && t.url.startsWith(recipe.url))
}
if (page === undefined) throw new Error(`没找到页面：${recipe.url ?? recipe.open}`)

const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })

let seq = 0
const pending = new Map()
ws.onmessage = e => {
  const msg = JSON.parse(e.data)
  const slot = pending.get(msg.id)
  if (slot === undefined) return
  pending.delete(msg.id)
  if (msg.error) slot.rej(new Error(JSON.stringify(msg.error)))
  else slot.res(msg.result)
}
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq
  pending.set(id, { res, rej })
  ws.send(JSON.stringify({ id, method, params }))
})

const evaluate = async body => {
  const r = await send('Runtime.evaluate', {
    expression: `(async () => { ${body} })()`,
    awaitPromise: true, returnByValue: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed')
  return r.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: recipe.width, height: recipe.height,
  deviceScaleFactor: recipe.scale ?? 2, mobile: false,
})

/** 等一次 load 事件。Page.reload 之后 eval 上下文要重建，急着 evaluate 会打空。 */
const waitForLoad = () => new Promise(res => {
  const prev = ws.onmessage
  ws.onmessage = e => {
    prev(e)
    if (JSON.parse(e.data).method === 'Page.loadEventFired') { ws.onmessage = prev; res() }
  }
})

let lastValue = null
for (const shot of recipe.shots) {
  lastValue = null
  if (shot.reload) {
    const loaded = waitForLoad()
    await send('Page.reload', { ignoreCache: true })
    await loaded
    await new Promise(r => setTimeout(r, shot.settle ?? 4000))
  }
  if (shot.script) {
    const out = await evaluate(shot.script)
    lastValue = out ?? null
    if (out !== undefined) console.log(`  [${shot.name}]`, JSON.stringify(out).slice(0, 300))
  }
  let clip
  // 脚本可以自己回一个 __clip 盒子：有些目标（摘要卡）没有稳定的 CSS 钩子，
  // 与其为了截图往产品代码里加 class，不如让脚本现场量
  if (lastValue !== null && typeof lastValue === 'object' && lastValue.__clip) {
    const b = lastValue.__clip
    clip = { x: b.x, y: b.y, width: b.width, height: b.height, scale: 1 }
  } else if (shot.clip) {
    const box = await evaluate(`
      const el = document.querySelector(${JSON.stringify(shot.clip)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    `)
    if (box === null) throw new Error(`clip 选择器没命中：${shot.clip}`)
    const pad = shot.pad ?? 0
    clip = { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2, scale: 1 }
  }
  const { data } = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: false, ...(clip ? { clip } : {}),
  })
  const file = `${recipe.out}/${shot.name}.png`
  writeFileSync(file, Buffer.from(data, 'base64'))
  console.log(`✓ ${file}`)
}

await send('Emulation.clearDeviceMetricsOverride')
ws.close()
if (openedId !== undefined) await fetch(`${ENDPOINT}/json/close/${openedId}`)
