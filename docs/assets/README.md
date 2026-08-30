# 视觉物料 / Visual assets

README 里的图**全部是真实渲染**——跑起来的面板，用 CDP 抓 2x 高清图，没有手绘的
mockup。这样图和产品不会随着迭代慢慢对不上。

Every image in the README is a **real screenshot** of the running panel, captured at
2× through CDP — no mockups. That way the pictures cannot quietly drift away from
the product.

## 重新生成 / Regenerating

需要一个开着远程调试的 Chrome，和一个跑着本插件的 profile：

```sh
# 1. 起一个装了本插件的 profile（端口按你自己的 profile 来）
dsh --profile insight --no-open

# 2. 起一个开了调试端口的 Chrome，打开那个地址
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir=/tmp/shoot-profile \
  http://127.0.0.1:3082

# 3. 抓图 → 压缩
node scripts/shoot.mjs <recipe.json>       # 见下方 recipe 格式
node scripts/optimize-images.mjs           # raw/ → 成品（缩到 1800 宽）
```

`scripts/shoot.mjs` 的 recipe 是一个 JSON：

```jsonc
{
  "url": "http://127.0.0.1:3082",   // 或 "open": "file:///…/hero.html" 另开标签页拍
  "width": 1760, "height": 1260, "scale": 2,
  "out": "docs/assets/raw",
  "shots": [{
    "name": "plugins",
    "reload": true, "settle": 6500,   // 先重载并等页面稳定
    "script": "…在页面里跑的 async 函数体，用来切轴、选行…",
    "clip": "[role=dialog][aria-label='洞察']", "pad": 26
  }]
}
```

脚本也可以让 `script` 回一个 `{ __clip: {x,y,width,height} }` 自己指定裁剪框——
摘要卡没有稳定的 CSS 钩子，与其为了截图往产品代码里加 class，不如现场量。

## 横幅 / Banner

`docs/hero/hero.html` 与 `social.html` 是横幅与社交预览卡的源文件，用同一个
`shoot.mjs` 渲染成图。它们引用两张图：

- `bg.png` — 分层结构的抽象底图（AI 生成，一次性物料，已入库）
- `shot.png` — 从 `raw/plugins.png` 裁出的界面上半部分（派生物，不入库）

重建 `shot.png`：

```sh
python3 -c "
from PIL import Image
im = Image.open('docs/assets/raw/plugins.png'); w, h = im.size; pad = 52
im.crop((pad, pad, w - pad, pad + int((h - pad*2) * 0.56))).save('docs/hero/shot.png')"
```

## 唯一的一处替换 / The one substitution

截图里是**真实 profile 的真实数据**——插件名、服务、工具、模型全是实际跑出来的。

只有一处例外：抓图前会跑一次 `sanitize()`，把详情面板里的**家目录那一段**换成
`/Users/you`。它只改 DOM 里的文本节点，不动产品代码——面板照常显示真实路径，
改的只是这一帧。路径的形状（profile 名、`node_modules`、包名）全部保留，
换掉的只有「这是谁的机器」。

公开仓库不该带着作者的本机用户名到处跑，而为了截图去改产品代码更不对。

Everything in the screenshots is **real data from a real profile**. One exception:
a `sanitize()` pass runs before capture and rewrites the **home-directory segment**
of paths in the detail pane to `/Users/you`. It edits text nodes in the DOM only —
the product still shows the real path; just this frame does not. The shape of the
path is untouched; only "whose machine" is.

重拍别的机器时留意：`sanitize()` 匹配的是 `/Users/<name>`，Windows / Linux 上的
路径形状不同，要相应调整。 / Note when re-shooting elsewhere: `sanitize()` matches
`/Users/<name>`; adjust it for Windows or Linux path shapes.
