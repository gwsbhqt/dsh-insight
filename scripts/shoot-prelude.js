/**
 * 抓图脚本的公共前奏：打开工作台、切轴、选行、净化本机路径。
 * 拼在 recipe 的每个 shot.script 前面使用，见 docs/assets/README.md。
 */
const wait = ms => new Promise(r => setTimeout(r, ms));
const txt = t => [...document.querySelectorAll('button,[role="tab"],li,a')].filter(x => x.textContent.trim() === t).pop();
const wb = () => [...document.querySelectorAll('[role="dialog"]')].find(d => [...d.querySelectorAll('button')].some(b => b.textContent.trim() === '按插件'));
const openWb = async () => {
  if (wb()) return;
  if (!document.querySelector('[role="dialog"]')) { txt('设置')?.click(); await wait(1000); }
  txt('洞察')?.click(); await wait(1400);
  [...document.querySelectorAll('button')].filter(x => x.textContent.trim().startsWith('打开')).pop()?.click();
  await wait(1600);
};
const axis = async name => { [...wb().querySelectorAll('button')].find(b => b.textContent.trim() === name).click(); await wait(500); };
const body = () => wb().querySelector('.grid.min-h-0 > div').firstElementChild.children[1];
const rows = () => [...body().children].filter(k => k.getAttribute('data-selected') !== null);
const pick = async pred => {
  const r = rows().find(pred);
  if (!r) return null;
  r.click(); await wait(500);
  return r.textContent.trim().slice(0, 40);
};

/**
 * 截图前把本机绝对路径换成中性占位。
 *
 * 只动 DOM 里的文本节点，不动产品代码——面板照常显示真实路径，改的只是这一帧。
 * 换的只有「谁的家目录」这一段，路径形状（profile 名、node_modules、包名）全是真的。
 */
const sanitize = () => {
  const root = wb() ?? document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  let n;
  while ((n = walker.nextNode())) if (n.textContent.includes('/Users/')) hits.push(n);
  for (const t of hits) {
    t.textContent = t.textContent
      .replace(/\/Users\/[^/\s]+\/dotfiles\/agents/g, '/Users/you')
      .replace(/\/Users\/[^/\s]+/g, '/Users/you');
  }
  return hits.map(t => t.textContent.slice(0, 70));
};
