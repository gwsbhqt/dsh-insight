import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { EntryTree } from "@deepseek-ai/cordis-plugin-loader";
import { open, readFile, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadOptionalPatches, loadProfile } from "@deepseek-ai/dsh-app-boot";
import { applyEntryPatches } from "@deepseek-ai/cordis-plugin-include";
//#region src/shared/types.ts
/** 包私有 RPC 通道名（host: connection.rpc.handle；client: connection.rpc.call）。 */
const INSIGHT_CHANNEL = "/dsh-insight";
//#endregion
//#region src/shared/graph.ts
function buildGraphIndex(nodes) {
	const dependsOn = /* @__PURE__ */ new Map();
	const dependedBy = /* @__PURE__ */ new Map();
	const serviceOf = /* @__PURE__ */ new Map();
	const ensure = (service) => {
		let entry = serviceOf.get(service);
		if (entry === void 0) {
			entry = {
				service,
				consumers: [],
				builtin: false
			};
			serviceOf.set(service, entry);
		}
		return entry;
	};
	for (const node of nodes) {
		dependsOn.set(node.id, /* @__PURE__ */ new Set());
		dependedBy.set(node.id, /* @__PURE__ */ new Set());
	}
	for (const node of nodes) for (const provided of node.provides) {
		const entry = ensure(provided.service);
		if (entry.provider === void 0 && entry.candidates === void 0) entry.provider = node.id;
		else {
			entry.candidates = [...entry.candidates ?? (entry.provider === void 0 ? [] : [entry.provider]), node.id];
			delete entry.provider;
		}
	}
	for (const node of nodes) for (const required of node.requires) {
		const entry = ensure(required.service);
		entry.consumers.push(node.id);
		if (required.builtin === true) entry.builtin = true;
		if (required.providers.length === 1) {
			const provider = required.providers[0];
			if (provider !== node.id) {
				dependsOn.get(node.id)?.add(provider);
				dependedBy.get(provider)?.add(node.id);
			}
		}
	}
	return {
		dependsOn,
		dependedBy,
		services: [...serviceOf.values()].sort((a, b) => b.consumers.length - a.consumers.length || a.service.localeCompare(b.service)),
		serviceOf,
		knowsBuiltin: nodes.some((n) => n.requires.some((r) => r.builtin !== void 0))
	};
}
/**
* 该插件依赖的服务里，没有任何插件提供、且不是内置的——这是真问题。
* @param knowsBuiltin - host 是否具备内置服务识别能力；不具备时一律返回空，
*   因为此时「无人提供」既可能是真缺失也可能是内置服务，报出来必然一半是假的。
*/
function missingProviders(node, knowsBuiltin = true) {
	if (!knowsBuiltin) return [];
	return node.requires.filter((r) => r.providers.length === 0 && r.builtin !== true).map((r) => r.service);
}
//#endregion
//#region src/shared/summary.ts
/**
* 摘要：设置页那 556px 要显示的全部内容。
*
* 存在的理由是"打开设置第一眼就该知道系统健不健康"——这恰好是旧面板完全没有的东西。
* 它必须能独立于工作台计算，因为设置页不该为了显示六个数字去拉 174 个节点的全量树。
*/
function* walk(nodes) {
	for (const node of nodes) {
		yield node;
		yield* walk(node.children);
	}
}
/** 需要人处理的：加载失败、卡在等待、依赖的服务没有任何插件提供（内置不算）。 */
function attentionOf(nodes, graph, knowsBuiltin) {
	const graphById = new Map(graph.map((g) => [g.id, g]));
	const ids = [];
	for (const node of nodes) {
		if (node.group) continue;
		if (node.state === "failed" || node.state === "pending" || node.state === "loading" || node.state === "unknown") {
			ids.push(node.shortId);
			continue;
		}
		const g = graphById.get(node.id);
		if (g !== void 0 && missingProviders(g, knowsBuiltin).length > 0) ids.push(node.shortId);
	}
	return [...new Set(ids)].sort();
}
function buildSummary(tree, graph, settings, layers, final) {
	const all = [...walk(tree)].filter((node) => !node.group);
	const index = buildGraphIndex(graph);
	const attention = attentionOf([...walk(tree)], graph, index.knowsBuiltin);
	const overrides = settings.filter((s) => s.user !== void 0).map((s) => s.ns).sort();
	const extra = new Set(final?.driftReport.extraInRuntime ?? []);
	const last = layers[layers.length - 1];
	return {
		plugins: all.length,
		active: all.filter((n) => n.state === "active").length,
		disabled: all.filter((n) => n.state === "disabled").length,
		attention: attention.length,
		attentionIds: attention.slice(0, 8),
		userOverrides: overrides.length,
		userOverrideIds: overrides.slice(0, 8),
		runtimeOnly: final === void 0 ? 0 : all.filter((n) => extra.has(n.shortId)).length,
		services: index.services.length,
		layers: layers.length,
		lastLayer: last?.label ?? "",
		lastLayerWritable: last !== void 0 && !last.readonly
	};
}
//#endregion
//#region src/host/files.ts
/**
* 配置文件清单：当前 profile 涉及的 patch 层、settings、credentials 元数据、root cordis.yml。
* credentials 的正文永不读取，也不进入预览 allowlist。
*/
async function fileInfo(path, layer, role) {
	try {
		const s = await stat(path);
		if (!s.isFile()) return void 0;
		return {
			path,
			layer,
			role,
			size: s.size,
			mtimeMs: s.mtimeMs,
			previewable: role !== "credentials"
		};
	} catch {
		return;
	}
}
async function credentialsInfo(path) {
	return fileInfo(path, "credentials", "credentials");
}
/**
* 从 Harness home 直接采集（可测形态）。
* @param home - $DSH_HOME。
* @param profileName - profile 名。
* @param layers - rebuildLayers 的分层（bundle 层带 patchPath）。
*/
async function collectFilesFromHome(home, profileName, layers) {
	const profileDir = join(home, "profiles", profileName);
	return (await Promise.all([
		...layers.map((l) => l.patchPath === void 0 ? Promise.resolve(void 0) : fileInfo(l.patchPath, l.kind === "bundle" ? `bundle:${l.label}` : l.kind, "patch")),
		fileInfo(join(profileDir, "cordis.yml"), "root", "root-config"),
		fileInfo(join(home, "settings.yaml"), "settings", "settings"),
		credentialsInfo(join(home, ".credentials.yaml"))
	])).filter((e) => e !== void 0);
}
/** 运行时形态：home 取 ctx.dshHomePath（boot 提供），profile 名取 ctx.baseUrl 末段。 */
async function collectFiles(ctx, layers) {
	return collectFilesFromHome(ctx.dshHomePath?.() ?? process.env.DSH_HOME ?? join(homedir(), ".dsh"), profileNameOf(ctx), layers);
}
/** ctx.baseUrl 形如 file:///…/profiles/<name>/ —— 取末段目录名。 */
function profileNameOf(ctx) {
	return new URL(ctx.baseUrl ?? "").pathname.replace(/\/+$/, "").split("/").pop() ?? "web";
}
const PREVIEW_MAX_BYTES = 262144;
/** 将路径解析到真实文件，并要求它属于 Host 给出的允许集合。 */
async function assertAllowedPath(path, allowedPaths) {
	if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`);
	const resolved = await realpath(path);
	const allowed = /* @__PURE__ */ new Set();
	for (const candidate of allowedPaths) try {
		allowed.add(await realpath(candidate));
	} catch {}
	if (!allowed.has(resolved)) throw new Error("该路径不在 Insight 可访问范围内");
	return resolved;
}
/**
* 预览授权必须同时满足 Host 已发现且该角色允许读取正文。
* @param path - 请求预览的路径。
* @param files - 分层清单里的配置文件（credentials 那类 previewable 为 false，天然被挡在外面）。
* @param extra - 不走分层清单、但同样是纯文本配置的路径（如预设的两个文件）。
*/
function authorizePreviewPath(path, files, extra = []) {
	return assertAllowedPath(path, [...files.filter((file) => file.previewable).map((file) => file.path), ...extra]);
}
/** 预览用读文件：只从文件句柄读取前 256 KiB，不把大文件整体载入内存。 */
async function readFilePreview(path) {
	if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`);
	const handle = await open(path, "r");
	try {
		const st = await handle.stat();
		if (!st.isFile()) throw new Error(`不是普通文件，无法预览：${path}`);
		const maxRead = Math.min(st.size, 262148);
		const buffer = Buffer.allocUnsafe(maxRead);
		const { bytesRead } = await handle.read(buffer, 0, maxRead, 0);
		const truncated = st.size > PREVIEW_MAX_BYTES;
		const slice = buffer.subarray(0, Math.min(bytesRead, PREVIEW_MAX_BYTES));
		return {
			content: new TextDecoder("utf-8").decode(slice).replace(/\uFFFD+$/, ""),
			truncated
		};
	} finally {
		await handle.close();
	}
}
//#endregion
//#region src/host/open.ts
/** 用本地编辑器打开路径：优先 code（VS Code），缺席回退 zed。 */
function trySpawn(cmd, arg) {
	return new Promise((resolve) => {
		const child = spawn(cmd, [arg], {
			stdio: "ignore",
			detached: true
		});
		child.on("error", () => resolve(false));
		child.on("spawn", () => {
			child.unref();
			resolve(true);
		});
	});
}
async function openInEditor(path) {
	if (!isAbsolute(path)) throw new Error(`不是绝对路径：${path}`);
	if (await trySpawn("code", path)) return { editor: "code" };
	if (await trySpawn("zed", path)) return { editor: "zed" };
	throw new Error("未找到 code 或 zed 命令");
}
//#endregion
//#region src/shared/vendor.ts
/** 官方 scope：dsh 与 cordis 全都发在这个 scope 下。 */
const OFFICIAL_SCOPE = "@deepseek-ai/";
/** 路径里最后一段 node_modules 之后的包名（`node_modules/@scope/pkg/` 或 `node_modules/pkg/`）。 */
const PKG_IN_PATH = /[\\/]node_modules[\\/](@[\w.-]+[\\/][\w.-]+|[\w.-]+)(?=[\\/]|$)/g;
/**
* 只知道一个磁盘目录时的出处判定（预设的 root 就是这种情况：它是目录，不是包）。
*
* 与 {@link vendorOf} 是同一条规则的另一种入口——**判据必须只有一份**，否则会出现
* 「同一个包在这张表是官方、在那张表是三方」。这里比它多做一件事：把包名也认出来，
* 因为三方预设最该回答的问题是「哪个插件把它带进来的」。
* @param path - 绝对目录路径。
* @returns 出处；在 node_modules 里时连带给出包名。
*/
function vendorOfPath(path) {
	if (path === "") return { vendor: "local" };
	const pkg = [...path.matchAll(PKG_IN_PATH)].at(-1)?.[1]?.replace(/\\/g, "/");
	if (pkg === void 0) return { vendor: "local" };
	return pkg.startsWith(OFFICIAL_SCOPE) ? {
		vendor: "official",
		pkg
	} : {
		vendor: "third-party",
		pkg
	};
}
//#endregion
//#region src/host/presets.ts
/**
* 预设清单：一行一个 agent 预设，回答「有几个、从哪来、谁写的、里面装了什么」。
*
* 预设是什么：一个目录，里面一份 `agent.cordis.yml`（agent 面的插件组合）
* 加一份可选的 `preset.yml`（显示用的名字和说明）。目录名就是预设 id。
* 会话开起来的时候挑一个预设，它决定这个会话能用哪些工具、看到哪些提示词。
*
* 三件事各有各的来源，不能混：
*
*   **有几个、从哪来** —— 走 `agentPresets` 服务的只读面 `list()`。它每次调用都
*   重扫磁盘（上游明说不做记忆），所以面板看到的永远是此刻的实况：刚写的预设立刻
*   出现，刚删的立刻消失。
*
*   **内置 / 三方 / 本地** —— 上游只记 `trust: system | user`（发行带的 / 本地写的），
*   分不出「三方插件带进来的那一批」。而那恰恰是最该问清楚的一档：一个预设决定
*   模型手里有哪些工具，「这份组合是谁塞进来的」和「它是不是官方发的」不是同一个问题。
*   所以这里再判一次，判据是**它所在 root 目录的磁盘位置**，和其他各轴共用
*   {@link vendorOfPath} 那一条规则：不在 node_modules 里 = 本地，在官方 scope 下 =
*   官方，其余 = 三方（并连带说出是哪个包）。root 不靠配置猜，从预设自己的路径倒推
*   两级——这样配置里怎么写的都不影响结论。
*
*   **配置是什么** —— 直接读 composition 文件并按 dsh 的 YAML 方言解析
*   （`!!js` 表达式原样保留成 `{__jsExpr}`，见下面的 JS_EXPR_TAG）。**不求值**：
*   `disabled: !!js process.platform === 'win32'` 这种行，静态侧只知道「有个表达式」，
*   不知道真假——`Boolean({__jsExpr})` 恒为 true 是陷阱，host/final.ts 已经栽过一次。
*
* 只读边界：全程只 stat 和读这两个文件，不写、不改、不碰任何 mount。
*/
function isPresets(value) {
	return value != null && typeof value.list === "function";
}
/** 显示元数据文件的名字（上游 METADATA_FILE 同值；它没导出，这里按文件名认）。 */
const METADATA_FILE = "preset.yml";
/**
* dsh 的 entry-list YAML 方言：`!!js <表达式>` 构造成 `{ __jsExpr: '<表达式>' }`。
*
* 和 dsh-app-boot 内部那份是同一个约定（host/final.ts 的 jsExprOf 读的就是它）。
* 非用不可：预设里 `disabled: !!js process.platform === 'win32'` 是常规写法，
* 拿默认 schema 去 load 会在这一行直接抛「unknown tag」，整个预设就读不出来了。
*/
const JS_EXPR_TAG = "tag:yaml.org,2002:js";
let dialect;
/**
* 拿到解析 composition 用的 YAML 方言，只备一次。
*
* 为什么是动态 import：js-yaml 不是本包的依赖，它是 `@deepseek-ai/dsh-app-boot` 和
* `@deepseek-ai/dsh-agent-presets` 各自的依赖。也就是说——**能读到预设服务，就一定
* 装了 js-yaml**。但「一定」是今天的事实不是契约，所以静态 import 会把「上游哪天换了
* YAML 库」变成「dsh-insight 整个插件加载失败」。动态 + 兜底，最坏也只是这一轴少一列。
* @returns 方言；js-yaml 不在时返回 null。
*/
async function yamlDialect() {
	if (dialect !== void 0) return dialect;
	try {
		const mod = await import("js-yaml");
		const yaml = mod.default ?? mod;
		const jsExpr = new yaml.Type(JS_EXPR_TAG, {
			kind: "scalar",
			construct: (data) => ({ __jsExpr: data })
		});
		dialect = {
			yaml,
			schema: yaml.JSON_SCHEMA.extend(jsExpr)
		};
	} catch {
		dialect = null;
	}
	return dialect;
}
/** `!!js` 表达式节点里的原文。 */
function jsExprOf$1(value) {
	if (typeof value !== "object" || value === null) return void 0;
	const expr = value.__jsExpr;
	return typeof expr === "string" ? expr : void 0;
}
/** group 行声明的私有 realm：`isolate: { planMode: true }` → ['planMode']。 */
function isolateNames(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
	const names = Object.keys(value).sort();
	return names.length > 0 ? names : void 0;
}
/** composition 的一行 → PresetEntry；容器行往下递归。 */
function toEntry(raw) {
	if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return void 0;
	const row = raw;
	const name = typeof row.name === "string" ? row.name : "";
	const group = row.group === true;
	const expr = jsExprOf$1(row.disabled);
	const entry = {
		id: typeof row.id === "string" ? row.id : "",
		name,
		group,
		disabled: expr === void 0 && row.disabled === true
	};
	if (expr !== void 0) entry.disabledExpr = expr;
	const isolate = isolateNames(row.isolate);
	if (isolate !== void 0) entry.isolate = isolate;
	if (group) entry.children = Array.isArray(row.config) ? row.config.flatMap((child) => {
		const e = toEntry(child);
		return e === void 0 ? [] : [e];
	}) : [];
	else if (row.config !== void 0) entry.config = row.config;
	return entry;
}
/** 非容器行的总数 = 这个预设真正装了多少个插件。 */
function countPlugins(rows) {
	let n = 0;
	for (const row of rows) if (row.group) n += countPlugins(row.children ?? []);
	else n += 1;
	return n;
}
/** 读一份 composition。读不出来就把原因带回去，不抛——一个坏预设不该拖垮整张清单。 */
async function readComposition(path) {
	const d = await yamlDialect();
	if (d === null) return { rowsError: "js-yaml 不可用，读不出 composition（文件本身没问题，可以点开看原文）" };
	let content;
	try {
		content = await readFile(path, "utf8");
	} catch (error) {
		return { rowsError: error instanceof Error ? error.message : String(error) };
	}
	let parsed;
	try {
		parsed = d.yaml.load(content, { schema: d.schema });
	} catch (error) {
		return { rowsError: error instanceof Error ? error.message : String(error) };
	}
	if (!Array.isArray(parsed)) return { rowsError: "composition 的顶层必须是一个列表" };
	return { rows: parsed.flatMap((row) => {
		const e = toEntry(row);
		return e === void 0 ? [] : [e];
	}) };
}
/**
* 每个预设现在有几个活着的会话在用。
*
* 判据照抄上游 `resolveSessionPreset` 的语义：创建时选的记在 header 里，之后每换一次
* 记一条 `agent-preset/selected` 事件，**最后一条赢**。只读 header 会把「中途换过预设的
* 会话」算回它创建时那个——那正是上游专门写一个解析函数、而不是直接读 header 的原因。
*
* 不 import 上游那个函数，是因为它所在的包不是本包的依赖；这里按同样的规则读同样的
* 两个公开字段（`session.header` 与 `session.events`），规则变了会在测试里现形。
* @returns 按预设 id 的会话数；agents 服务缺席时是 undefined ——「不知道」不能说成「没人用」。
*/
function sessionPresets(ctx) {
	const agents = ctx.get("agents");
	if (agents === void 0) return void 0;
	try {
		const counts = /* @__PURE__ */ new Map();
		for (const agent of agents.list()) {
			const id = presetOfSession(agent.session);
			if (id === void 0) continue;
			counts.set(id, (counts.get(id) ?? 0) + 1);
		}
		return counts;
	} catch {
		return;
	}
}
/** 一个会话此刻跑在哪个预设上。 */
function presetOfSession(session) {
	if (session === void 0) return void 0;
	const events = session.events ?? [];
	for (let i = events.length - 1; i >= 0; i -= 1) {
		if (events[i]?.type !== "agent-preset/selected") continue;
		const id = (events[i]?.data)?.agentPreset;
		return typeof id === "string" ? id : void 0;
	}
	const header = session.header?.agentPreset;
	return typeof header === "string" ? header : void 0;
}
/** 文件的大小与改动时间；文件不在就没有。 */
async function fileFacts(path) {
	try {
		const s = await stat(path);
		return s.isFile() ? {
			bytes: s.size,
			mtimeMs: s.mtimeMs
		} : {};
	} catch {
		return {};
	}
}
/** preset.yml 在不在。 */
async function hasFile(path) {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}
/**
* 采集预设清单。
* @param ctx - 本进程的 cordis 上下文。
* @returns 清单；agentPresets 服务缺席时是空清单，不是错误——那只说明这个 profile
*   没组预设，跟「出问题了」不是一回事。
*/
async function collectPresets(ctx) {
	const service = ctx.get("agentPresets");
	if (!isPresets(service)) return {
		presets: [],
		roots: [],
		sessionsKnown: false,
		service: "missing"
	};
	let list;
	try {
		list = await service.list();
	} catch {
		return {
			presets: [],
			roots: [],
			sessionsKnown: false,
			service: "ok"
		};
	}
	let defaultId;
	try {
		const id = service.defaultId;
		if (typeof id === "string" && id !== "") defaultId = id;
	} catch {
		defaultId = void 0;
	}
	const usage = sessionPresets(ctx);
	const presets = await Promise.all(list.map(async (p) => {
		const dir = dirname(p.path);
		const root = dirname(dir);
		const { vendor, pkg } = vendorOfPath(root);
		const metaPath = join(dir, METADATA_FILE);
		const [facts, meta, composition] = await Promise.all([
			fileFacts(p.path),
			hasFile(metaPath),
			readComposition(p.path)
		]);
		const row = {
			id: p.id,
			trust: p.trust,
			vendor,
			dir,
			path: p.path,
			root,
			isDefault: p.id === defaultId,
			...pkg === void 0 ? {} : { pkg },
			...p.name === void 0 ? {} : { name: p.name },
			...p.description === void 0 ? {} : { description: p.description },
			...p.order === void 0 ? {} : { order: p.order },
			...p.broken === void 0 ? {} : { broken: p.broken },
			...meta ? { metaPath } : {},
			...usage === void 0 ? {} : { sessions: usage.get(p.id) ?? 0 },
			...facts,
			...composition
		};
		if (composition.rows !== void 0) row.plugins = countPlugins(composition.rows);
		return row;
	}));
	const byRoot = /* @__PURE__ */ new Map();
	for (const p of presets) {
		const seen = byRoot.get(p.root);
		if (seen === void 0) byRoot.set(p.root, {
			path: p.root,
			trust: p.trust,
			vendor: p.vendor,
			count: 1,
			...p.pkg === void 0 ? {} : { pkg: p.pkg }
		});
		else seen.count += 1;
	}
	for (const declared of service.config?.roots ?? []) {
		const path = trimSep(typeof declared.path === "string" ? declared.path : "");
		if (path === "" || path.startsWith("~") || byRoot.has(path)) continue;
		const { vendor, pkg } = vendorOfPath(path);
		byRoot.set(path, {
			path,
			trust: declared.trust === "user" ? "user" : "system",
			vendor,
			count: 0,
			...pkg === void 0 ? {} : { pkg }
		});
	}
	return {
		presets: presets.sort((a, b) => {
			const ao = a.order ?? Number.MAX_SAFE_INTEGER;
			const bo = b.order ?? Number.MAX_SAFE_INTEGER;
			return ao !== bo ? ao - bo : a.id.localeCompare(b.id);
		}),
		roots: [...byRoot.values()],
		...defaultId === void 0 ? {} : { defaultId },
		sessionsKnown: usage !== void 0,
		service: "ok"
	};
}
/**
* 预设涉及的路径，**只列不读**：给预览与「在编辑器中打开」的白名单用。
*
* 单独一条轻量路径，是因为白名单是每次点击都要建的，而 {@link collectPresets}
* 会把每份 composition 都解析一遍（几百行 YAML × 预设个数）。为了判一句
* 「这个路径能不能读」去做那件事，纯属浪费。
* @param ctx - 本进程的 cordis 上下文。
* @returns files = 可预览的两个文本文件；dirs = 可以在编辑器里打开的预设目录。
*/
async function presetPaths(ctx) {
	const service = ctx.get("agentPresets");
	if (!isPresets(service)) return {
		files: [],
		dirs: []
	};
	try {
		const list = await service.list();
		const files = [];
		const dirs = /* @__PURE__ */ new Set();
		for (const p of list) {
			const dir = dirname(p.path);
			dirs.add(dir);
			dirs.add(dirname(dir));
			files.push(p.path, join(dir, METADATA_FILE));
		}
		return {
			files,
			dirs: [...dirs]
		};
	} catch {
		return {
			files: [],
			dirs: []
		};
	}
}
/** 削掉尾部的路径分隔符（根目录 `/` 除外，那一整个就是它自己）。 */
function trimSep(path) {
	const trimmed = path.replace(/[\\/]+$/u, "");
	return trimmed === "" ? path : trimmed;
}
//#endregion
//#region src/host/toggle.ts
/**
* 在 profile 的补丁层里禁用 / 启用一个插件。
*
* **这是这个插件唯一的写路径。** 面板的其余部分严格只读，所以这里的每一条约束都是
* 明写出来的，而不是靠「小心一点」：
*
*   1. **只写 profile 补丁层那一个文件**（`$DSH_HOME/profiles/<name>/cordis.patch.yml`）。
*      bundle 层在 node_modules 里，那是包管理器的地盘；home 层是跨 profile 的公共层。
*      两者都不碰——写错地方比写错内容更难收拾。
*   2. **逐行改文本，绝不重新序列化 YAML。** 用 js-yaml 读进来再 dump 出去，语法是对的，
*      但用户那一整份注释会被抹掉——而补丁文件里的注释恰恰是「为什么关掉它」的唯一记录。
*      所以这里只动该动的那一行，其余字节原样保留。
*   3. **短 id 撞名就拒绝。** 补丁按 id 命中，同一个短 id 在运行时有两份时，写下去会同时
*      命中两个。这一轴一贯的态度是不猜，写操作更没有猜的余地。
*   4. **原子落盘**：先写同目录的临时文件再 rename，中途断电不会留下半份配置。
*/
/** 新插入的那一段上面写这一行，好让人知道它是谁加的、怎么改回去。 */
const TOGGLE_COMMENT = "# 「洞察」面板加的：在面板里点禁用/启用会改下面这一行";
/** 允许写进 YAML 的 id 形状。补丁按 id 命中，它不该带引号、换行或注释符。 */
const SAFE_ID = /^[A-Za-z0-9_.:-]+$/u;
/** 顶层列表项：以 `- ` 开头且不缩进的行开启一段，直到下一段或文件结束。 */
function topLevelBlocks(lines) {
	const blocks = [];
	for (const [i, line] of lines.entries()) {
		if (!/^-(\s|$)/u.test(line)) continue;
		const last = blocks.at(-1);
		if (last !== void 0) last.end = i;
		blocks.push({
			start: i,
			end: lines.length
		});
	}
	return blocks;
}
/** 去掉 YAML 标量外面的引号。 */
function unquote(value) {
	const trimmed = value.trim();
	return /^(['"])(.*)\1$/u.exec(trimmed)?.[2] ?? trimmed;
}
/**
* 一段里 `id:` 那一行的行号与值。
* 首行写成 `- id: x` 是常规写法；`- name: x` 后面另起一行写 `id:` 也认。
*/
function idLineOf(lines, block) {
	const head = /^-\s+id:\s*(.*)$/u.exec(lines[block.start] ?? "");
	if (head !== null) return {
		line: block.start,
		id: unquote(head[1] ?? "")
	};
	for (let i = block.start; i < block.end; i += 1) {
		const key = /^\s+id:\s*(.*)$/u.exec(lines[i] ?? "");
		if (key !== null) return {
			line: i,
			id: unquote(key[1] ?? "")
		};
	}
}
/** 一段里键的缩进（`- id: x` 的 `id` 落在第 2 列）。取块内第一条缩进键的实际缩进。 */
function keyIndent(lines, block) {
	for (let i = block.start + 1; i < block.end; i += 1) {
		const indent = /^(\s+)\S/u.exec(lines[i] ?? "");
		if (indent !== null) return indent[1] ?? "  ";
	}
	return "  ";
}
/** 一段里顶层 `disabled:` 那一行（嵌在 config 里更深的同名键不算）。 */
function disabledLineOf(lines, block) {
	const indent = keyIndent(lines, block);
	if (/^-\s+disabled:\s/u.test(lines[block.start] ?? "")) return block.start;
	for (let i = block.start + 1; i < block.end; i += 1) if (lines[i] === `${indent}disabled:` || (lines[i] ?? "").startsWith(`${indent}disabled: `)) return i;
}
/**
* 这一段是不是「只有一条 disabled、且没人给它写过说明」——只有这种才允许整段删掉。
*
* 两个条件缺一不可。body 只有 disabled：说明这一段的全部内容就是这个开关，
* 删掉它不会带走别的配置。上面没有别人的注释：注释是写给这一段的，
* 段没了注释就成了指向空气的一句话——**宁可留一行废配置，也不孤立别人写的解释**。
* 我们自己那行 TOGGLE_COMMENT 例外，它本来就是跟着这一段一起写的。
*/
function removable(lines, block) {
	const idLine = idLineOf(lines, block)?.line ?? block.start;
	for (let i = block.start; i < block.end; i += 1) {
		if (i === idLine || (lines[i] ?? "").trim() === "") continue;
		if (!/^\s*-?\s*disabled:\s/u.test(lines[i] ?? "")) return false;
	}
	const above = (lines[block.start - 1] ?? "").trim();
	return above === "" || above === "# 「洞察」面板加的：在面板里点禁用/启用会改下面这一行" || block.start === 0;
}
/**
* 把「id 的 disabled 设成某个值」落到文本上。
*
* 三条路径：已有这一段且已有 disabled 行 → 只改那一行；已有这一段但没有 disabled 行 →
* 在 id 那一行后面插一行；这一段根本不存在 → 末尾追加一段，并在上面留一行注释。
* 还有第四条路径：目标状态和**不写这一行时的状态**一样，那这一行就是废话。
* 这时不是把它改成 `disabled: false` 留在那儿，而是删掉——补丁层是「你对默认做了什么」
* 的清单，一条什么都没做的记录只会让下次读它的人多花时间确认它没做什么。
* @param text - 补丁文件现有的全部文本（文件不存在时传空串）。
* @param id - 要命中的 entry id。
* @param disabled - 目标状态。
* @param redundant - 不写这一行的话，效果是不是就等于目标状态。true 则走删除路径。
*/
function rewritePatch(text, id, disabled, redundant = false) {
	const value = disabled ? "true" : "false";
	const eol = text.includes("\r\n") ? "\r\n" : "\n";
	const lines = text.split(/\r?\n/u);
	const hit = topLevelBlocks(lines).find((b) => idLineOf(lines, b)?.id === id);
	if (redundant) {
		if (hit === void 0) return {
			text,
			action: "unchanged"
		};
		const at = disabledLineOf(lines, hit);
		if (at === void 0) return {
			text,
			action: "unchanged"
		};
		if (!removable(lines, hit)) {
			const copy = [...lines];
			copy.splice(at, 1);
			return {
				text: copy.join(eol),
				action: "removed"
			};
		}
		const from = (lines[hit.start - 1] ?? "").trim() === "# 「洞察」面板加的：在面板里点禁用/启用会改下面这一行" ? hit.start - 1 : hit.start;
		const copy = [...lines];
		copy.splice(from, hit.end - from);
		if ((copy[from - 1] ?? "").trim() === "" && (copy[from] ?? "").trim() === "") copy.splice(from, 1);
		return {
			text: copy.join(eol),
			action: "removed"
		};
	}
	if (hit !== void 0) {
		const at = disabledLineOf(lines, hit);
		if (at !== void 0) {
			const next = `${/^(\s*-?\s*)/u.exec(lines[at] ?? "")?.[1] ?? "  "}disabled: ${value}`;
			if (lines[at] === next) return {
				text,
				action: "unchanged"
			};
			const copy = [...lines];
			copy[at] = next;
			return {
				text: copy.join(eol),
				action: "updated"
			};
		}
		const idLine = idLineOf(lines, hit);
		const copy = [...lines];
		copy.splice((idLine?.line ?? hit.start) + 1, 0, `${keyIndent(lines, hit)}disabled: ${value}`);
		return {
			text: copy.join(eol),
			action: "updated"
		};
	}
	const body = [
		TOGGLE_COMMENT,
		`- id: ${id}`,
		`  disabled: ${value}`
	].join(eol);
	const base = text.replace(/\s*$/u, "");
	return {
		text: `${base === "" ? "" : `${base}${eol}${eol}`}${body}${eol}`,
		action: "inserted"
	};
}
/** 目标文件必须落在 $DSH_HOME 里，且不许在 node_modules 里。 */
function writableTarget(path, home) {
	if (!isAbsolute(path) || /[\\/]node_modules[\\/]/u.test(path)) return false;
	const rel = relative(home, path);
	return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}
/** 原子落盘：同目录临时文件 + rename，中途断电不会留下半份配置。 */
async function writeAtomic(path, text) {
	const tmp = join(dirname(path), `.${String(process.pid)}-${String(Date.now())}.dsh-insight.tmp`);
	try {
		await writeFile(tmp, text, "utf8");
		await rename(tmp, path);
	} catch (error) {
		await unlink(tmp).catch(() => {});
		throw error;
	}
}
/**
* 在补丁文件上执行一次禁用 / 启用。
* @param opts.path - profile 补丁文件的绝对路径。
* @param opts.home - $DSH_HOME，用来确认写的地方没跑偏。
* @param opts.id - 要命中的 entry id（短 id）。
* @param opts.disabled - 目标状态。
* @param opts.matches - **重放出来的配置**里这个 id 有几份：0 = 补丁命不中，>1 = 真撞名。
*   判据是配置而不是运行时，理由见 rpc.ts 里 config/toggle 那一段。
* @param opts.redundant - 不写这一行的话效果就等于目标状态——那就删掉它，别留一行废话。
*/
async function applyToggle(opts) {
	if (!SAFE_ID.test(opts.id)) return {
		ok: false,
		reason: "refused",
		message: `id 形状不合法：${opts.id}`
	};
	if (opts.matches === 0) return {
		ok: false,
		reason: "not-found",
		message: `配置里没有 ${opts.id} 这一条（运行时注册的插件就是这样），按 id 写补丁命不中它`
	};
	if (opts.matches > 1) return {
		ok: false,
		reason: "ambiguous",
		message: `配置里有 ${String(opts.matches)} 条都叫 ${opts.id}，按 id 写下去会同时命中它们`
	};
	if (!writableTarget(opts.path, opts.home)) return {
		ok: false,
		reason: "refused",
		message: `只写 $DSH_HOME 里的 profile 补丁层，不写 ${opts.path}`
	};
	let text = "";
	try {
		text = await readFile(opts.path, "utf8");
	} catch {
		text = "";
	}
	const { text: next, action } = rewritePatch(text, opts.id, opts.disabled, opts.redundant === true);
	if (action !== "unchanged") try {
		await writeAtomic(opts.path, next);
	} catch (error) {
		return {
			ok: false,
			reason: "failed",
			message: error instanceof Error ? error.message : String(error)
		};
	}
	return {
		ok: true,
		path: opts.path,
		action,
		disabled: opts.disabled
	};
}
//#endregion
//#region src/host/restart.ts
/**
* 自助重启：按当前进程原来的启动方式再拉起一个 dsh，然后把自己关掉。
*
* 做法整体照搬 dsh-market（https://github.com/dsh-market/dsh-market 的
* src/restart.ts，最早由 #14 @ysyyhhh 贡献）。那边踩过的坑这里一个都不敢省：
*   - 老进程还占着端口，新进程起来就 EADDRINUSE 当场死掉（#177）；
*   - Windows 上 detached 起的新进程没有控制台，它再起的每个子进程都会弹黑窗（#40）；
*   - Windows 默认执行策略会拒绝 dsh.ps1，必须点名 dsh.cmd（#397）；
*   - systemd 托管时，老进程一死整个 cgroup 跟着死，接力进程也被带走——
*     结果是「服务被杀掉且再也起不来」（#229）。
*
* 安全边界：这个模块只被 RPC 通道调用，而那条通道是 `authority: 'loopback'`
* ——宿主已经挡掉了非本机、跨站点的请求，这里不再重复做同一件事。
*/
/** 本次进程的启动标识：重启后必然换一个，客户端靠它认出「新进程已经起来了」。 */
const BOOT_ID = `${String(process.pid)}-${String(Date.now())}`;
/**
* 看这台机器上的 dsh 是不是被进程守护托管着。认不出来就返回 null。
*
* 为什么要判、又为什么判得这么啰嗦：systemd 默认 `KillMode=control-group`，
* 老进程一死，同一个 cgroup 里的东西全陪葬——包括本该把新进程拉起来的接力进程。
* 于是「重启」变成了「杀掉服务并且再也起不来」。
*
* 两个信号缺一不可。`INVOCATION_ID` 是**会继承的**：systemd 单元的每个后代都带着它，
* 在 Linux 上这包括普通桌面终端（shell 本身就挂在用户会话单元下）和 CI runner。
* 只看它就等于在一大批本来好好的机器上把按钮灰掉，那比要防的问题更糟。
* `ppid === 1` 才能区分「我就是这个单元的主进程」和「我只是它的后代」——
* systemd 从 PID 1 fork 服务，而终端里的 node 父进程是 shell。
*
* 只认 systemd 是故意的。pm2 的 `pm_id` 同样会继承，而它的守护进程不是 PID 1，
* 没有等价的第二信号，猜就会把刚才那个误判重新引回来；launchd 干脆什么标记都没有。
* 这两种情况仍然可以用 DSH_INSIGHT_ALLOW_RESTART=0 显式关掉。
* @param env - 进程环境变量，测试可注入。
* @param ppid - 父进程 pid，测试可注入。
*/
function detectedSupervisor(env = process.env, ppid = process.ppid) {
	const set = (name) => (env[name] ?? "") !== "";
	if ((set("INVOCATION_ID") || set("JOURNAL_STREAM")) && ppid === 1) return "systemd";
	return null;
}
/**
* 自助重启默认开着；`DSH_INSIGHT_ALLOW_RESTART=0`（或 false/off/no）显式关掉，
* 认出进程守护时默认也关掉——重启归它管。
*
* 显式写 1/true 仍然赢：已经把单元配成 `KillMode=process` 的运维在表态，
* 这里不该替他们做主。
* @param env - 进程环境变量，测试可注入。
* @param ppid - 父进程 pid，测试可注入。
*/
function restartAllowed(env = process.env, ppid = process.ppid) {
	const flag = (env.DSH_INSIGHT_ALLOW_RESTART ?? "").trim().toLowerCase();
	if (flag !== "") return ![
		"0",
		"false",
		"off",
		"no"
	].includes(flag);
	return detectedSupervisor(env, ppid) === null;
}
/**
* 用来起子进程的真 node 可执行文件。
*
* Android 上内核是通过动态链接器跑 node 的，`process.execPath` 会是
* `/apex/.../linker64`——拿它当 node 用，链接器会把第一个参数当成程序路径然后报错。
* `process.argv0` 里是真正的 node 二进制，是绝对路径且存在时优先用它。
* @param argv0 - `process.argv0`，测试可注入。
* @param execPath - `process.execPath`，测试可注入。
*/
function nodeExecutable(argv0 = process.argv0, execPath = process.execPath) {
	if (argv0 !== void 0 && argv0 !== "" && isAbsolute(argv0) && existsSync(argv0)) return argv0;
	return execPath;
}
/** Windows 上裸 `dsh` 是个 .cmd 垫片，只有 shell 能起。 */
const WIN_CMD_SHIM = process.platform === "win32";
/** 接力进程要原样重放的那条启动命令。 */
function restartLaunch() {
	const entry = process.argv[1];
	if (entry !== void 0 && /[\\/](?:bin\.(?:js|ts)|dsh)$/u.test(entry)) {
		const abs = resolve(entry);
		return {
			file: nodeExecutable(),
			args: [
				...process.execArgv,
				abs,
				...process.argv.slice(2)
			],
			cwd: dirname(abs),
			viaShell: false
		};
	}
	return {
		file: "dsh",
		args: [...process.argv.slice(2)],
		cwd: process.cwd(),
		viaShell: WIN_CMD_SHIM
	};
}
/**
* 把启动命令翻译成当前平台真正能用的 spawn 参数。
*
* Windows 上 `detached` 会映射成 DETACHED_PROCESS：新进程完全没有控制台，
* 它之后起的每个控制台子进程（比如 dsh 的沙箱工具）都会弹一个可见的 node 窗口。
* 套一层 `powershell -WindowStyle Hidden` 能给它一个**隐藏的**控制台，子进程继承即可。
* POSIX 保持普通的 detached spawn。
* @param launch - restartLaunch 的结果。
* @param platform - `process.platform`，测试可注入。
*/
function respawnInvocation(launch, platform = process.platform) {
	if (platform !== "win32") return {
		file: launch.file,
		args: launch.args,
		viaShell: launch.viaShell,
		detached: true
	};
	const quote = (part) => `'${part.replace(/'/gu, "''")}'`;
	return {
		file: "powershell.exe",
		args: [
			"-NoProfile",
			"-WindowStyle",
			"Hidden",
			"-Command",
			[`& ${quote(launch.viaShell && !/\.(?:cmd|bat)$/iu.test(launch.file) ? `${launch.file}.cmd` : launch.file)}`, ...launch.args.map(quote)].join(" ")
		],
		viaShell: false,
		detached: false
	};
}
/**
* 接力进程的源码：它活得比我们久，负责把替身拉起来。
*
* 单独抽出来是为了能**跑起来测**——这类 bug 只有真跑才现形，光看每一行都是对的。
*
* 它必须做三件事，一件都不能少：等端口真的静下来、起替身、然后**确认替身起来了**，
* 没起来就写一份诊断。重启失败必须留下证据——本来该记这笔账的进程，
* 正是刚刚退出的那个。
* @param port - 替身必须占回的端口；不知道就退回固定延时，总比什么都不等强。
*/
function restartHelperSource(spawned, launch, logs, port) {
	return [
		"const { spawn } = require('node:child_process')",
		"const fs = require('node:fs')",
		"const net = require('node:net')",
		`const file = ${JSON.stringify(spawned.file)}`,
		`const args = ${JSON.stringify(spawned.args)}`,
		`const cwd = ${JSON.stringify(launch.cwd)}`,
		`const viaShell = ${JSON.stringify(spawned.viaShell)}`,
		`const detached = ${JSON.stringify(spawned.detached)}`,
		`const logOut = ${JSON.stringify(logs.out)}`,
		`const logErr = ${JSON.stringify(logs.err)}`,
		`const port = ${JSON.stringify(port)}`,
		"const sleep = (ms) => new Promise(r => setTimeout(r, ms))",
		"const note = (line) => { try { fs.appendFileSync(logErr, `[dsh-insight] ${line}\\n`) } catch {} }",
		"const listening = () => new Promise((resolve) => {",
		"  const probe = net.connect({ host: \"127.0.0.1\", port })",
		"  const done = (value) => { probe.destroy(); resolve(value) }",
		"  probe.on(\"connect\", () => done(true))",
		"  probe.on(\"error\", () => done(false))",
		"  setTimeout(() => done(false), 500)",
		"})",
		"const main = async () => {",
		"  if (port) {",
		"    const until = Date.now() + 30000",
		"    while (Date.now() < until && await listening()) await sleep(250)",
		"    if (await listening()) note(`port ${port} was still in use after 30s; starting anyway`)",
		"    await sleep(300)",
		"  } else {",
		"    await sleep(1500)",
		"  }",
		"  let child",
		"  try {",
		"    const out = fs.openSync(logOut, \"a\")",
		"    const err = fs.openSync(logErr, \"a\")",
		"    child = spawn(file, args, { cwd, detached, stdio: [\"ignore\", out, err], env: process.env, shell: viaShell })",
		"    child.on(\"error\", (error) => note(`could not start the replacement: ${error && error.message ? error.message : error}`))",
		"    child.unref()",
		"  } catch (error) {",
		"    note(`could not start the replacement: ${error && error.message ? error.message : error}`)",
		"    return",
		"  }",
		"  if (!port) { await sleep(3000); return }",
		"  const upBy = Date.now() + 20000",
		"  while (Date.now() < upBy && !(await listening())) await sleep(500)",
		"  if (!(await listening())) note(`the replacement did not bind port ${port} within 20s — see the output log beside this one`)",
		"}",
		"main()"
	].join("\n");
}
/**
* 交接给一个脱离出去的接力进程，然后关掉自己。接力进程活得比我们久
* （detached + unref），会等我们的端口释放再起替身，日志落在临时目录。
* @param port - 本进程正在服务的端口，交给接力进程去等，不靠猜延时。
*/
function scheduleRestart(port = null) {
	const launch = restartLaunch();
	const spawned = respawnInvocation(launch);
	const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/gu, "-").slice(0, 19);
	const logOut = join(tmpdir(), `dsh-insight-restart-${stamp}.out.log`);
	const logErr = join(tmpdir(), `dsh-insight-restart-${stamp}.err.log`);
	const helper = spawn(nodeExecutable(), ["-e", restartHelperSource(spawned, launch, {
		out: logOut,
		err: logErr
	}, port)], {
		detached: true,
		stdio: "ignore",
		env: process.env
	});
	helper.unref();
	setTimeout(() => process.kill(process.pid, "SIGTERM"), 500);
	return {
		pid: process.pid,
		helperPid: helper.pid,
		logOut,
		logErr
	};
}
//#endregion
//#region src/host/layers.ts
/**
* 配置分层重建与逐层重放。
* 重建走 dsh-app-boot 的 loadProfile/loadOptionalPatches——与启动同一代码路径，
* 语义等价是字面保证。重放用 cordis-plugin-include 的 applyEntryPatches 逐层
* 推进并 diff 快照，产出每层的命中标注（M3 在此基础上扩成完整溯源事件流）。
*
* 已知缺口：--patch 覆盖层与遥测开关只存在于运行时 include config，重建拿不到；
* 由 loader 对账的 drift 标记兜住。
*/
/**
* 按应用顺序重建分层：bundle 层（dsh.profile.bundles 序）→ profile 用户层 → home 层。
* @param opts.anchor - 调用方包自身的 package.json 路径（bundle 解析锚点；
*   真正生效的是 loadProfile 内部的 profileDir 回退）。
*/
function rebuildLayers(opts) {
	const profile = loadProfile("dsh-insight", opts.profileName, opts.anchor, opts.home);
	const layers = profile.layers.map((l) => ({
		kind: "bundle",
		label: l.packageName,
		patchPath: l.patchPath,
		patches: l.patches
	}));
	layers.push({
		kind: "profile",
		label: "profile",
		patchPath: profile.patchPath,
		patches: profile.patches
	});
	const homePath = join(opts.home, "cordis.patch.yml");
	const homePatches = loadOptionalPatches("dsh-insight", homePath);
	if (homePatches !== void 0) layers.push({
		kind: "home",
		label: "$DSH_HOME",
		patchPath: homePath,
		patches: homePatches
	});
	return layers;
}
/** 本包装载位置（lib/index.js 的上一级）的 package.json，作为 rebuildLayers 的 anchor。 */
function ownAnchor() {
	return fileURLToPath(new URL("../package.json", import.meta.url));
}
function stableValue(value, seen = /* @__PURE__ */ new WeakSet()) {
	if (value === void 0) return { __type: "undefined" };
	if (typeof value === "bigint") return {
		__type: "bigint",
		value: value.toString()
	};
	if (typeof value === "function") return {
		__type: "function",
		value: String(value)
	};
	if (typeof value !== "object" || value === null) return value;
	if (seen.has(value)) return { __type: "circular" };
	seen.add(value);
	if (Array.isArray(value)) return value.map((item) => stableValue(item, seen));
	return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stableValue(item, seen)]));
}
/**
* 静态 disabled：`!!js` 表达式返回 undefined（重放不求值，静态侧不知道真假）。
* 与 host/final.ts 的 jsExprOf 是同一条纪律——`Boolean({__jsExpr})` 恒为 true 是陷阱。
*/
function staticDisabled(value) {
	if (typeof value === "object" && value !== null && typeof value.__jsExpr === "string") return void 0;
	return Boolean(value);
}
function entryEqual(a, b) {
	return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}
/** 逐层重放：返回终态、每层命中的 entry id、每 entry 的跨层溯源事件流。 */
function replayLayers(layers) {
	let entries = [];
	const hits = [];
	const events = {};
	for (const layer of layers) {
		const before = new Map(entries.map((e) => [e.id, e]));
		entries = applyEntryPatches(entries, structuredClone(layer.patches), () => {});
		const touched = [];
		for (const entry of entries) {
			if (entry.id === void 0) continue;
			const prev = before.get(entry.id);
			if (prev !== void 0 && entryEqual(prev, entry)) continue;
			let kind;
			if (prev === void 0) kind = "insert";
			else {
				const was = staticDisabled(prev.disabled);
				const now = staticDisabled(entry.disabled);
				kind = now !== void 0 && now !== was ? now ? "disable" : "enable" : "update";
			}
			touched.push({
				id: entry.id,
				kind
			});
			(events[entry.id] ??= []).push({
				layer: layer.label,
				kind
			});
		}
		hits.push(touched);
	}
	return {
		final: entries,
		hits,
		events
	};
}
/** node_modules 内的文件归包管理器所有——只读；之外的是用户自己的——可写。 */
function isReadonlyPath(path) {
	return /[\/]node_modules[\/]/.test(path);
}
/** 与重放命中拼成视图数据（内容不再随列表传输——客户端用 patchPath 走 files/read 预览）。 */
function layerViews(layers) {
	const { hits } = replayLayers(layers);
	return layers.map((layer, i) => {
		const view = {
			kind: layer.kind,
			label: layer.label,
			hits: hits[i] ?? [],
			readonly: layer.patchPath !== void 0 && isReadonlyPath(layer.patchPath)
		};
		if (layer.patchPath !== void 0) view.patchPath = layer.patchPath;
		return view;
	});
}
//#endregion
//#region src/host/final.ts
/** `!!js` 表达式节点：dsh-app-boot 的 YAML dialect 把 `!!js foo` 构造成 `{ __jsExpr: 'foo' }`。 */
function jsExprOf(value) {
	if (typeof value !== "object" || value === null) return void 0;
	const expr = value.__jsExpr;
	return typeof expr === "string" ? expr : void 0;
}
function countById(ids) {
	const counts = /* @__PURE__ */ new Map();
	for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
	return counts;
}
/**
* 组装终态视图。
* drift 对账可观察的 entry 集合与静态 boolean disabled；config 不比对，因为 Loader 不暴露同形终态配置。
* extra 项可能来自运行时动态注册；撞名与表达式 disabled 不参与比对，单列在 ambiguous / unevaluated。
* @param replayed - replayLayers 的终态。
* @param live - ctx.loader.entries() 的 (id, disabled) 投影（id 已按 EntryTree.sep 归一化，可能撞名）。
*/
function toFinalConfig(replayed, live, events = {}) {
	const entries = replayed.map((e) => {
		const expr = jsExprOf(e.disabled);
		const entry = {
			id: e.id ?? "",
			name: String(e.name ?? ""),
			disabled: expr === void 0 && Boolean(e.disabled),
			config: e.config ?? null
		};
		if (expr !== void 0) entry.disabledExpr = expr;
		const ev = events[entry.id];
		if (ev !== void 0 && ev.length > 0) entry.events = ev;
		return entry;
	});
	const replayById = new Map(entries.map((entry) => [entry.id, entry]));
	const liveById = new Map(live.map((entry) => [entry.id, entry]));
	const liveCounts = countById(live.map((entry) => entry.id));
	const replayCounts = countById(entries.map((entry) => entry.id));
	const missingInRuntime = entries.filter((entry) => !liveById.has(entry.id)).map((entry) => entry.id);
	const extraInRuntime = live.filter((entry) => !replayById.has(entry.id)).map((entry) => entry.id);
	const ambiguous = [...new Set([...liveCounts.keys(), ...replayCounts.keys()].filter((id) => (liveCounts.get(id) ?? 0) > 1 || (replayCounts.get(id) ?? 0) > 1))].sort();
	const ambiguousSet = new Set(ambiguous);
	const unevaluated = entries.filter((entry) => entry.disabledExpr !== void 0).map((entry) => entry.id);
	const unevaluatedSet = new Set(unevaluated);
	const disabledMismatch = entries.filter((entry) => {
		if (ambiguousSet.has(entry.id) || unevaluatedSet.has(entry.id)) return false;
		const runtime = liveById.get(entry.id);
		return runtime !== void 0 && runtime.disabled !== entry.disabled;
	}).map((entry) => entry.id);
	const driftReport = {
		missingInRuntime,
		extraInRuntime,
		disabledMismatch,
		ambiguous,
		unevaluated
	};
	return {
		entries,
		drift: missingInRuntime.length > 0 || extraInRuntime.length > 0 || disabledMismatch.length > 0,
		driftReport
	};
}
//#endregion
//#region src/host/tree.ts
/**
* 插件树采集：从 ctx.loader 实况逐 entry 投影成 PluginNode，再按嵌套 id 前缀重建层级。
* 全部字段读取都容错——单个 entry 的异常不能拖垮整棵树。
*/
/**
* Fiber.state 的数字含义（cordis 的 FiberState 是 const enum，import 有 isolatedModules 风险）：
* 0 PENDING / 1 LOADING / 2 ACTIVE / 3 FAILED / 4 DISPOSED / 5 UNLOADING。
*/
const FIBER_STATE = {
	0: "pending",
	1: "loading",
	2: "active",
	3: "failed",
	4: "disposed",
	5: "disposed"
};
function stateOf(entry) {
	if (entry.disabled) return "disabled";
	const fiber = entry.fiber;
	if (fiber === void 0) return "pending";
	return FIBER_STATE[fiber.state] ?? "unknown";
}
function errorOf(entry, state) {
	if (state !== "failed") return void 0;
	const raw = entry.fiber?._error;
	if (raw instanceof Error) {
		const out = { message: raw.message };
		if (raw.stack !== void 0) out.stack = raw.stack;
		return out;
	}
	return { message: String(raw) };
}
/** 遍历 loader 实况，投影成拍平的 PluginNode 列表（children 为空，层级由 buildTree 重建）。 */
function collectNodes(ctx, options = {}) {
	const nodes = [];
	for (const raw of ctx.loader.entries()) {
		const entry = raw;
		try {
			const id = entry.id;
			const sep = id.lastIndexOf(EntryTree.sep);
			const shortId = sep < 0 ? id : id.slice(sep + 1);
			const name = String(entry.options.name ?? "");
			const node = {
				id,
				shortId,
				name,
				group: Boolean(entry.options.group) || entry.subtree !== void 0,
				disabled: Boolean(entry.disabled),
				state: stateOf(entry),
				children: []
			};
			const error = errorOf(entry, node.state);
			if (error !== void 0) node.error = error;
			if (entry.fiber !== void 0 && FIBER_STATE[entry.fiber.state] === void 0) node.rawState = entry.fiber.state;
			const fiber = entry.fiber;
			if (fiber?.store !== void 0) {
				const provides = Object.keys(fiber.store).filter((k) => {
					const owner = fiber.store?.[k]?.fiber;
					return owner === fiber || owner !== void 0 && owner.entry === raw;
				});
				if (provides.length > 0) node.provides = provides.sort();
			}
			const injectSource = fiber?.inject ?? entry.options.inject;
			const injectKeys = Array.isArray(injectSource) ? injectSource.map(String) : Object.keys(injectSource ?? {});
			if (injectKeys.length > 0) node.requires = injectKeys.sort();
			const origin = options.originOf?.(shortId);
			if (origin !== void 0) node.origin = origin;
			if (name !== "") {
				const path = options.resolvePath?.(name);
				if (path !== void 0) node.path = path;
			}
			nodes.push(node);
		} catch (error) {
			nodes.push({
				id: "(collect-error)",
				shortId: "(collect-error)",
				name: "",
				group: false,
				disabled: false,
				state: "failed",
				error: { message: error instanceof Error ? error.message : String(error) },
				children: []
			});
		}
	}
	return nodes;
}
/** 把拍平节点按嵌套 id 前缀重建成森林：父 = id 去掉最后一段，找不到父则挂根。 */
function buildTree(nodes) {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const roots = [];
	for (const node of nodes) {
		const sep = node.id.lastIndexOf(EntryTree.sep);
		const parent = sep < 0 ? void 0 : byId.get(node.id.slice(0, sep));
		if (parent === void 0) roots.push(node);
		else parent.children.push(node);
	}
	return roots;
}
/** 一步到位：采集 + 建树。 */
function collectTree(ctx, options = {}) {
	return buildTree(collectNodes(ctx, options));
}
//#endregion
//#region src/host/graph.ts
function collectGraph(ctx) {
	const resolvable = (service) => {
		const get = ctx.get;
		if (typeof get !== "function") return false;
		try {
			return get.call(ctx, service) !== void 0;
		} catch {
			return false;
		}
	};
	const nodes = collectNodes(ctx);
	const providersOf = /* @__PURE__ */ new Map();
	for (const n of nodes) for (const service of n.provides ?? []) {
		const providers = providersOf.get(service) ?? [];
		providers.push(n.id);
		providersOf.set(service, providers);
	}
	const consumersOf = /* @__PURE__ */ new Map();
	for (const n of nodes) for (const service of n.requires ?? []) {
		const list = consumersOf.get(service) ?? [];
		list.push(n.id);
		consumersOf.set(service, list);
	}
	return nodes.map((n) => ({
		id: n.id,
		shortId: n.shortId,
		name: n.name,
		state: n.state,
		provides: (n.provides ?? []).map((service) => ({
			service,
			consumers: consumersOf.get(service) ?? []
		})),
		requires: (n.requires ?? []).map((service) => {
			const providers = providersOf.get(service) ?? [];
			return {
				service,
				providers,
				builtin: providers.length === 0 && resolvable(service)
			};
		})
	}));
}
//#endregion
//#region src/host/models.ts
/** 顺着 settingsPath 往下取，拿这条 provider 自己那一段配置。 */
function at(value, path) {
	let cur = value;
	for (const seg of path) {
		if (cur === null || typeof cur !== "object") return void 0;
		cur = cur[seg];
	}
	return cur;
}
/** 配置里写的环境变量名（只要名字，不碰值）。 */
function apiKeyEnvOf(settings, route) {
	if (settings === void 0 || route.settingsNs === void 0) return void 0;
	const env = at(settings.describe({ redactSecrets: true }).find((d) => d.ns === route.settingsNs)?.value, route.settingsPath ?? [])?.apiKeyEnv;
	return typeof env === "string" && env !== "" ? env : void 0;
}
function isLlm(value) {
	const v = value;
	return v != null && typeof v.listProviders === "function" && typeof v.listConfigurableProviders === "function" && typeof v.listModels === "function";
}
/** 采集模型清单。llm 服务缺席（精简 profile）时返回空清单而不是报错。 */
async function collectModels(ctx) {
	const llm = ctx.get("llm");
	if (!isLlm(llm)) return {
		models: [],
		providers: []
	};
	const wired = llm.listProviders();
	const wiredIds = new Set(wired.map((p) => p.id));
	const directory = llm.listConfigurableProviders();
	const declared = new Map(directory.map((d) => [d.provider, d]));
	const providers = [];
	for (const p of wired) {
		const d = declared.get(p.id);
		const route = {
			id: p.id,
			name: p.name,
			wired: true
		};
		if (d !== void 0) {
			route.settingsNs = d.settingsNs;
			route.settingsPath = [...d.settingsPath];
			route.displayName = d.displayName;
		}
		providers.push(route);
	}
	for (const d of directory) {
		if (wiredIds.has(d.provider)) continue;
		providers.push({
			id: d.provider,
			name: d.displayName,
			wired: false,
			settingsNs: d.settingsNs,
			settingsPath: [...d.settingsPath],
			displayName: d.displayName
		});
	}
	const models = [];
	for (const p of wired) {
		let listed;
		try {
			listed = await llm.listModels(p.id);
		} catch {
			continue;
		}
		for (const m of listed) {
			const model = {
				provider: p.id,
				id: m.id,
				name: m.name
			};
			if (m.description !== void 0 && m.description !== "") model.description = m.description;
			if (m.inputModalities !== void 0 && m.inputModalities.length > 0) model.inputModalities = [...m.inputModalities];
			models.push(model);
		}
	}
	let records = [];
	try {
		records = await ctx.get("credentials")?.listRecords() ?? [];
	} catch {
		records = [];
	}
	const kindOf = /* @__PURE__ */ new Map();
	for (const r of records) {
		const cut = String(r.key).indexOf("/");
		if (cut > 0) kindOf.set(`${String(r.key).slice(0, cut)}/${String(r.key).slice(cut + 1)}`, r.kind);
	}
	const settings = ctx.get("settings");
	for (const route of providers) {
		const stored = route.settingsNs === void 0 ? void 0 : kindOf.get(`${route.settingsNs}/${route.id}`);
		const env = apiKeyEnvOf(settings, route);
		if (stored === "grant") route.auth = "oauth";
		else if (stored === "api-key") route.auth = "api-key";
		else if (env !== void 0) route.auth = "env";
		else route.auth = "none";
		if (env !== void 0) route.authEnv = env;
	}
	const inventory = {
		models,
		providers
	};
	const chosen = ctx.get("agentDefaultModel")?.currentSelection?.();
	if (chosen !== void 0 && typeof chosen.provider === "string" && typeof chosen.model === "string") {
		inventory.default = {
			provider: chosen.provider,
			model: chosen.model
		};
		if (typeof chosen.reasoningEffort === "string") inventory.default.reasoningEffort = chosen.reasoningEffort;
	}
	return inventory;
}
//#endregion
//#region src/host/tool-observer.ts
/** 打在原型上的标记，防止 HMR 反复 apply 时层层套娃。 */
const PATCHED = Symbol.for("dsh-insight.toolObserver");
/** 调用栈里这些包是框架自己，跳过——真正的注册者在它们下面一层。 */
const FRAMEWORK = /* @__PURE__ */ new Set([
	"@deepseek-ai/cordis",
	"@deepseek-ai/cordis-plugin-loader",
	"@deepseek-ai/cordis-plugin-group",
	"@deepseek-ai/cordis-plugin-include",
	"@deepseek-ai/dsh",
	"@deepseek-ai/dsh-tools"
]);
const PKG = /node_modules\/(@[\w.-]+\/[\w.-]+|[\w.-]+)\//g;
/** 描述长度上限：够放完整的工具说明，又不至于让某个失控的字符串撑爆 RPC。 */
const MAX_DESC = 4e3;
/** 从调用栈里挑出第一个不是框架的包名 = 注册这个工具的插件包。 */
function callerPackage(stack) {
	for (const line of stack.split("\n").slice(1)) for (const m of line.matchAll(PKG)) {
		const pkg = m[1];
		if (!FRAMEWORK.has(pkg)) return pkg;
	}
}
/** 本次进程观察到的工具，键 = `包名\0工具名`（同名工具可能来自不同包）。
*  分隔符用转义写法而不是真的 NUL 字符——真字符会让 git 把整个文件判成二进制，
*  从此 diff 不了也 grep 不到。 */
const observed = /* @__PURE__ */ new Map();
function observedTools() {
	return [...observed.values()].sort((a, b) => a.name.localeCompare(b.name));
}
/**
* 装上观察器。返回还原函数交给 ctx.effect。
* @param tools - 运行时的 tools 服务实例；缺席（精简 profile）时什么也不做。
*/
function installToolObserver(tools) {
	if (tools === null || tools === void 0) return () => {};
	const proto = Object.getPrototypeOf(tools);
	if (proto === null || typeof proto.register !== "function") return () => {};
	if (proto[PATCHED] === true) return () => {};
	const original = proto.register;
	proto.register = function observedRegister(definition) {
		const result = original.call(this, definition);
		try {
			const name = definition?.name;
			if (typeof name === "string" && name !== "") {
				const pkg = callerPackage((/* @__PURE__ */ new Error("trace")).stack ?? "");
				const key = `${pkg ?? ""}\0${name}`;
				if (!observed.has(key)) {
					const entry = {
						name,
						source: "runtime"
					};
					if (pkg !== void 0) entry.pkg = pkg;
					const description = definition.description;
					if (typeof description === "string" && description !== "") entry.description = description.length > MAX_DESC ? `${description.slice(0, MAX_DESC).trimEnd()}…` : description;
					observed.set(key, entry);
				}
			}
		} catch {}
		return result;
	};
	proto[PATCHED] = true;
	return () => {
		proto.register = original;
		delete proto[PATCHED];
	};
}
//#endregion
//#region src/host/tool-scan.ts
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
/**
* 只认 `defineTool({` 与 `tools.register({`。
* 不能放宽成 `.register({`——那会把 slots.register / commands.register /
* settings.section 全抓进来：实测放宽后 117 条里 85 条是假的（误报 89 → 5）。
*/
const ANCHOR = /(?:\bdefineTool\s*\(\s*\{|\btools\s*\.\s*register\s*\(\s*(?:defineTool\s*\(\s*)?\{)/g;
const NAME = /\bname:\s*(?:"([A-Za-z_][\w.-]*)"|'([A-Za-z_][\w.-]*)')/;
/** 单个包目录扫多深就够——插件产物都在 lib/ 下，别把整棵树翻遍。 */
const MAX_DEPTH = 3;
const MAX_BYTES = 2097152;
function jsFiles(dir, depth = 0) {
	if (depth > MAX_DEPTH) return [];
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const out = [];
	for (const e of entries) {
		if (e.name === "node_modules" || e.name.startsWith(".")) continue;
		const path = join(dir, e.name);
		if (e.isDirectory()) out.push(...jsFiles(path, depth + 1));
		else if (e.isFile() && e.name.endsWith(".js")) out.push(path);
	}
	return out;
}
/** 扫一个插件包目录，返回它注册的工具名（字面量的那些）。 */
function scanToolNames(packageDir) {
	const names = /* @__PURE__ */ new Set();
	for (const file of jsFiles(packageDir)) {
		let src;
		try {
			if (statSync(file).size > MAX_BYTES) continue;
			src = readFileSync(file, "utf8");
		} catch {
			continue;
		}
		ANCHOR.lastIndex = 0;
		for (const m of src.matchAll(ANCHOR)) {
			const window = src.slice(m.index + m[0].length, m.index + m[0].length + 400);
			const nm = NAME.exec(window);
			if (nm !== null) names.add(nm[1] ?? nm[2]);
		}
	}
	return [...names].sort();
}
/** 按包目录缓存：同一次进程里同一个包只扫一次。 */
const cache = /* @__PURE__ */ new Map();
function scannedTools(packageDir, pkg) {
	const hit = cache.get(packageDir);
	if (hit !== void 0) return hit;
	const tools = scanToolNames(packageDir).map((name) => ({
		name,
		source: "scan",
		pkg
	}));
	cache.set(packageDir, tools);
	return tools;
}
//#endregion
//#region src/host/rpc.ts
/**
* 端点路由：把 INSIGHT_CHANNEL 上的 (endpoint, payload) 分发到对应采集器。
* 信封格式参考 dsh-codex-subscription 的 publicError 模式。
*/
/** 当前进程的 dsh home：从运行时拿，兜底环境变量与默认路径。 */
function homeOf(ctx) {
	return ctx.dshHomePath?.() ?? process.env.DSH_HOME ?? join(homedir(), ".dsh");
}
/** 当前进程的重建上下文：home 与 profile 名都从运行时拿。 */
function layersOf(ctx) {
	return rebuildLayers({
		profileName: profileNameOf(ctx),
		anchor: ownAnchor(),
		home: homeOf(ctx)
	});
}
/** 每条 entry 的来源层：短 ID 在运行时唯一时才归因，避免不同 realm 的同名节点串线。 */
function originResolver(layers, runtimeIds) {
	const { hits } = replayLayers(layers);
	const counts = /* @__PURE__ */ new Map();
	for (const id of runtimeIds) {
		const sep = id.lastIndexOf(EntryTree.sep);
		const shortId = sep < 0 ? id : id.slice(sep + 1);
		counts.set(shortId, (counts.get(shortId) ?? 0) + 1);
	}
	const origin = /* @__PURE__ */ new Map();
	hits.forEach((layerHits, i) => {
		const label = layers[i]?.label;
		if (label === void 0) return;
		for (const h of layerHits) if (!origin.has(h.id)) origin.set(h.id, label);
	});
	return (id) => counts.get(id) === 1 ? origin.get(id) : void 0;
}
/** 模块说明符 → 包磁盘目录：从 profile 根 require.resolve（软链/层级 node_modules 都覆盖）。 */
function pathResolverOf(ctx) {
	const require = createRequire(join(homeOf(ctx), "profiles", profileNameOf(ctx), "noop.js"));
	return (name) => {
		if (name === "" || name.startsWith("cordis:")) return void 0;
		try {
			return dirname(require.resolve(`${name}/package.json`));
		} catch {
			return;
		}
	};
}
/** loader 实况投影：归一化 id（嵌套 id 取最后一段，如 include:llm → llm）+ 有效 disabled（Entry.disabled 含父级传递）。 */
function liveStates(ctx) {
	const states = [];
	for (const entry of ctx.loader.entries()) {
		if (entry.options.group) continue;
		const sep = entry.id.lastIndexOf(EntryTree.sep);
		states.push({
			id: sep < 0 ? entry.id : entry.id.slice(sep + 1),
			disabled: entry.disabled
		});
	}
	return states;
}
/**
* 现在有几个会话正在执行。
*
* 判据是 agent 自己报的状态（idle / running），不是「有没有打开的会话」——
* 开着一个对话窗口不算忙，只有真在跑的那一轮才算。子 agent 也算：它在跑，
* 就说明有活正在进行，重启一样会把它打断。
* agents 服务缺席（精简 profile）时没有 agent，自然也没有在跑的会话。
*/
function runningAgents(ctx) {
	const agents = ctx.get("agents");
	if (agents === void 0) return 0;
	try {
		return agents.list().filter((a) => a.status === "running").length;
	} catch {
		return 0;
	}
}
/** 本进程正在服务的端口，交给接力进程去等；webServer 缺席就返回 null（退回固定延时）。 */
function servingPort(ctx) {
	const port = ctx.get("webServer")?.port;
	return typeof port === "number" && Number.isInteger(port) && port > 0 && port < 65536 ? port : null;
}
/** 创建 Connection RPC handler。 */
function createInsightHandler(ctx) {
	let restarting = false;
	const requestedPath = (payload) => String(payload?.path ?? "");
	const configFiles = async () => collectFiles(ctx, layersOf(ctx));
	const allowedFile = async (payload) => {
		const [files, presets] = await Promise.all([configFiles(), presetPaths(ctx)]);
		return authorizePreviewPath(requestedPath(payload), files, presets.files);
	};
	const allowedOpenPath = async (payload) => {
		const layers = layersOf(ctx);
		const [files, presets] = await Promise.all([collectFiles(ctx, layers), presetPaths(ctx)]);
		const pluginDirs = collectNodes(ctx, { resolvePath: pathResolverOf(ctx) }).flatMap((node) => node.path === void 0 ? [] : [node.path]);
		return assertAllowedPath(requestedPath(payload), [
			...files.filter((file) => file.role !== "credentials").map((file) => file.path),
			...pluginDirs,
			...presets.dirs,
			...presets.files
		]);
	};
	const settingsViews = () => {
		const settings = ctx.get("settings");
		if (settings === void 0) return [];
		return settings.describe({ redactSecrets: true }).map((d) => {
			const view = {
				ns: String(d.ns),
				value: d.value ?? null,
				applies: d.applies,
				secrets: (d.secrets ?? []).map((s) => ({
					path: s.path.join("."),
					set: s.set
				}))
			};
			if (d.base !== void 0) view.base = d.base;
			if (d.user !== void 0) view.user = d.user;
			return view;
		});
	};
	const pluginTree = () => {
		return collectTree(ctx, {
			originOf: originResolver(layersOf(ctx), [...ctx.loader.entries()].map((entry) => entry.id)),
			resolvePath: pathResolverOf(ctx)
		});
	};
	const producers = {
		"files/open": async (payload) => openInEditor(await allowedOpenPath(payload)),
		"files/read": async (payload) => readFilePreview(await allowedFile(payload)),
		"config/layers": () => layerViews(layersOf(ctx)),
		"files/list": async () => (await collectFiles(ctx, layersOf(ctx))).filter((f) => f.role !== "patch"),
		"config/final": () => {
			const { final, events } = replayLayers(layersOf(ctx));
			return toFinalConfig(final, liveStates(ctx), events);
		},
		"settings/list": () => settingsViews(),
		/**
		* 唯一的写路径：在 profile 补丁层里禁用 / 启用一个插件。
		*
		* 「运行时有几份」这一步在这边算而不在客户端算：撞名判断决定要不要落盘，
		* 这种判断不能建立在浏览器传上来的数字上。
		*/
		"config/toggle": async (payload) => {
			const body = payload ?? {};
			const id = typeof body.id === "string" ? body.id : "";
			const disabled = body.disabled === true;
			const layers = layersOf(ctx);
			const profile = layers.find((l) => l.kind === "profile");
			const home = homeOf(ctx);
			const path = profile?.patchPath ?? join(home, "profiles", profileNameOf(ctx), "cordis.patch.yml");
			const { final: replayed } = replayLayers(layers);
			const matches = replayed.filter((e) => e.id === id).length;
			const { final: base } = replayLayers(layers.filter((l) => l !== profile));
			const baseEntry = base.find((e) => e.id === id);
			return applyToggle({
				path,
				home,
				id,
				disabled,
				matches,
				redundant: !(typeof baseEntry?.disabled === "object" && baseEntry.disabled !== null) && Boolean(baseEntry?.disabled) === disabled
			});
		},
		"presets/list": () => collectPresets(ctx),
		"plugins/tree": () => pluginTree(),
		"plugins/graph": () => collectGraph(ctx),
		"models/list": () => collectModels(ctx),
		"plugins/tools": () => {
			const nodes = collectNodes(ctx, { resolvePath: pathResolverOf(ctx) });
			const graph = collectGraph(ctx);
			const pluginOfPkg = /* @__PURE__ */ new Map();
			const enabledOf = /* @__PURE__ */ new Map();
			for (const n of nodes) {
				if (n.name !== "" && !pluginOfPkg.has(n.name)) pluginOfPkg.set(n.name, n.shortId);
				enabledOf.set(n.shortId, (enabledOf.get(n.shortId) ?? false) || n.state === "active");
			}
			const injectsTools = new Set(graph.filter((g) => g.requires.some((r) => r.service === "tools")).map((g) => g.id));
			const canRegister = (n) => injectsTools.has(n.id) || n.shortId.startsWith("tool-");
			const runtime = observedTools();
			const seen = new Set(runtime.map((t) => `${t.pkg ?? ""} ${t.name}`));
			const fallback = [];
			for (const n of nodes) {
				if (!canRegister(n) || n.path === void 0 || n.name === "") continue;
				if (runtime.some((t) => t.pkg === n.name)) continue;
				for (const t of scannedTools(n.path, n.name)) {
					const key = `${t.pkg ?? ""} ${t.name}`;
					if (seen.has(key)) continue;
					seen.add(key);
					fallback.push(t);
				}
			}
			return {
				tools: [...runtime, ...fallback].map((t) => {
					const plugin = t.pkg === void 0 ? void 0 : pluginOfPkg.get(t.pkg);
					const enabled = plugin === void 0 ? void 0 : enabledOf.get(plugin);
					return {
						...t,
						...plugin === void 0 ? {} : { plugin },
						...enabled === void 0 ? {} : { enabled }
					};
				}).sort((a, b) => a.name.localeCompare(b.name)),
				observed: runtime.length > 0
			};
		},
		"insight/summary": () => {
			const layers = layersOf(ctx);
			const { final, events } = replayLayers(layers);
			return buildSummary(pluginTree(), collectGraph(ctx), settingsViews(), layerViews(layers), toFinalConfig(final, liveStates(ctx), events));
		},
		"host/status": () => {
			const supervisor = detectedSupervisor();
			return {
				boot: BOOT_ID,
				canRestart: restartAllowed(),
				...supervisor === null ? {} : { supervisor },
				running: runningAgents(ctx)
			};
		},
		"host/restart": () => {
			const supervisor = detectedSupervisor();
			if (!restartAllowed()) return {
				ok: false,
				reason: "off",
				message: supervisor === null ? "self-restart is turned off (DSH_INSIGHT_ALLOW_RESTART)" : `self-restart is off under ${supervisor}`,
				...supervisor === null ? {} : { supervisor }
			};
			const running = runningAgents(ctx);
			if (running > 0) return {
				ok: false,
				reason: "busy",
				message: `${String(running)} session(s) still running`,
				running
			};
			if (restarting) return {
				ok: false,
				reason: "scheduled",
				message: "a restart is already under way"
			};
			restarting = true;
			try {
				const { helperPid, ...result } = scheduleRestart(servingPort(ctx));
				return {
					ok: true,
					boot: BOOT_ID,
					...result,
					...helperPid === void 0 ? {} : { helperPid }
				};
			} catch (error) {
				restarting = false;
				return {
					ok: false,
					reason: "failed",
					message: error instanceof Error ? error.message : String(error)
				};
			}
		}
	};
	return async (endpoint, payload, signal) => {
		const produce = producers[endpoint];
		if (produce === void 0) return {
			ok: false,
			error: {
				code: "bad-request",
				message: `endpoint ${endpoint} not found — host 可能比前端旧，重启 dsh 后生效`,
				details: { issues: [] }
			}
		};
		try {
			signal.throwIfAborted();
			return {
				ok: true,
				value: await produce(payload, signal)
			};
		} catch (error) {
			if (signal.aborted) throw error;
			return {
				ok: false,
				error: {
					code: "internal",
					message: error instanceof Error ? error.message : String(error),
					details: {}
				}
			};
		}
	};
}
//#endregion
//#region src/host/index.ts
const name = "dsh-insight";
/** loader（对账/插件树）、connection（RPC）、settings（Settings 实况）。 */
const inject = [
	"loader",
	"connection",
	"settings"
];
function apply(ctx) {
	ctx.effect(() => installToolObserver(ctx.get("tools")), "dsh-insight: tool observer");
	ctx.effect(() => ctx.connection.rpc.handle(INSIGHT_CHANNEL, createInsightHandler(ctx), { authority: "loopback" }), "dsh-insight: rpc channel");
}
//#endregion
export { apply, inject, name };
