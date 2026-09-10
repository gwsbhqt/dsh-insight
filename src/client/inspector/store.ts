/**
 * Inspector 偏好的共享状态：一个模块级小 store。
 *
 * 为什么不用 React context：读它的两处不在同一棵组件树里——开关行在设置面板
 * 的 `settings.section` 里，浮层在 `shell.overlay` 里，各自是独立的 slot 出口。
 * 想套一个共同的 Provider 就得往 root 塞东西，那是壳的地盘。模块级 store +
 * useSyncExternalStore 是这里最小的解法。
 *
 * 跨浏览器标签也顺手同步：storage 事件一来就重读，免得两个标签的开关状态互相
 * 打脸（同一个 localStorage 键）。
 */
import { useSyncExternalStore } from 'react'
import { loadPrefs, savePrefs, type InspectorPrefs } from './prefs.ts'

let current: InspectorPrefs = loadPrefs()
const listeners = new Set<() => void>()

function emit(): void {
  for (const fn of listeners) fn()
}

export function getPrefs(): InspectorPrefs {
  return current
}

export function setPrefs(next: InspectorPrefs): void {
  current = next
  savePrefs(next)
  emit()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  if (listeners.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage)
  }
  return () => {
    listeners.delete(fn)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage)
    }
  }
}

function onStorage(): void {
  const next = loadPrefs()
  // 引用变了才通知：storage 事件对别的键也会来
  if (next.enabled !== current.enabled || next.modifiers.join() !== current.modifiers.join()) {
    current = next
    emit()
  }
}

export function useInspectorPrefs(): InspectorPrefs {
  return useSyncExternalStore(subscribe, getPrefs, getPrefs)
}
