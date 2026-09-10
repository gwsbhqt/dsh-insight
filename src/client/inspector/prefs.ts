/**
 * Inspector 的本机偏好：开关 + 触发用的修饰键。
 *
 * 存 localStorage 而不是走 dsh 的 settings：这是**这台机器上这个浏览器**的调试
 * 习惯（哪只手顺、跟别的快捷键冲不冲），不是 profile 配置，没有理由同步到
 * $DSH_HOME 里去，更不该出现在 insight 那份「谁改了什么」的账上。读写全程
 * try/catch——隐身窗口、禁用站点数据的浏览器里 localStorage 本身就会抛。
 */

/** 一个修饰键。名字照 KeyboardEvent 的四个布尔字段。 */
export type ModifierId = 'meta' | 'alt' | 'ctrl' | 'shift'

export const MODIFIERS: readonly ModifierId[] = ['meta', 'alt', 'ctrl', 'shift']

export interface InspectorPrefs {
  /** 关着的时候完全不装事件监听，也不打记账补丁。 */
  enabled: boolean
  /** 需要同时按住的修饰键；空数组视为无效，回落到默认。 */
  modifiers: ModifierId[]
}

/**
 * 默认关、默认 Option/Alt。
 *
 * 为什么默认关：它要在 window 上装捕获阶段的 click 拦截，开着就意味着「按住
 * Option 点任何东西都不会真的点下去」。这对不知道它存在的人是惊吓，所以必须
 * 是明确打开的东西。
 */
export const DEFAULT_PREFS: InspectorPrefs = { enabled: false, modifiers: ['alt'] }

const STORAGE_KEY = 'dsh-insight/inspector'

/** 按下的修饰键是否**恰好**是配置的那一组。 */
export function matchesModifiers(
  event: Pick<KeyboardEvent, 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'>,
  modifiers: readonly ModifierId[],
): boolean {
  if (modifiers.length === 0) return false
  const pressed: Record<ModifierId, boolean> = {
    meta: event.metaKey,
    alt: event.altKey,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
  }
  // 多按了别的修饰键也算不匹配：否则 ⌘⌥ 的宿主快捷键会顺带触发 inspector。
  return MODIFIERS.every(id => pressed[id] === modifiers.includes(id))
}

function sanitize(raw: unknown): InspectorPrefs {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PREFS
  const source = raw as { enabled?: unknown; modifiers?: unknown }
  const raws: unknown[] = Array.isArray(source.modifiers) ? source.modifiers : []
  const modifiers = MODIFIERS.filter(id => raws.includes(id))
  return {
    enabled: source.enabled === true,
    modifiers: modifiers.length > 0 ? [...modifiers] : [...DEFAULT_PREFS.modifiers],
  }
}

export function loadPrefs(): InspectorPrefs {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (raw === null || raw === undefined) return DEFAULT_PREFS
    return sanitize(JSON.parse(raw))
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: InspectorPrefs): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // 存不下就只在本次会话里生效，不值得打扰使用者。
  }
}
