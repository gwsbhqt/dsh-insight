// @vitest-environment jsdom
/**
 * 触发键判定与偏好的读写。两条要紧的规矩：
 *   多按了别的修饰键不算匹配（否则宿主的 ⌘⌥ 快捷键会顺带触发 inspector）；
 *   存坏了、读不到都回落到默认，绝不因为一份脏数据让功能变成开着却不响应。
 */
import { beforeEach, expect, it } from 'vitest'
import { DEFAULT_PREFS, loadPrefs, matchesModifiers, savePrefs } from '../src/client/inspector/prefs.ts'

const keys = (over: Partial<Record<'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey', boolean>> = {}) => ({
  metaKey: false, altKey: false, ctrlKey: false, shiftKey: false, ...over,
})

beforeEach(() => localStorage.clear())

it('恰好按住配置的那一组才算匹配', () => {
  expect(matchesModifiers(keys({ altKey: true }), ['alt'])).toBe(true)
  expect(matchesModifiers(keys(), ['alt'])).toBe(false)
  // 多按了 ⌘：宿主快捷键，不该顺带触发
  expect(matchesModifiers(keys({ altKey: true, metaKey: true }), ['alt'])).toBe(false)
})

it('组合键要全按齐', () => {
  expect(matchesModifiers(keys({ altKey: true, shiftKey: true }), ['alt', 'shift'])).toBe(true)
  expect(matchesModifiers(keys({ altKey: true }), ['alt', 'shift'])).toBe(false)
})

it('空配置永不匹配（不会出现「按什么都触发」）', () => {
  expect(matchesModifiers(keys({ altKey: true }), [])).toBe(false)
})

it('没存过就是默认：关着、⌥', () => {
  expect(loadPrefs()).toEqual(DEFAULT_PREFS)
})

it('存了能读回来', () => {
  savePrefs({ enabled: true, modifiers: ['meta', 'shift'] })
  expect(loadPrefs()).toEqual({ enabled: true, modifiers: ['meta', 'shift'] })
})

it('脏数据回落到默认的修饰键，且开关只认 true', () => {
  localStorage.setItem('dsh-insight/inspector', '{"enabled":"yes","modifiers":["nope"]}')
  expect(loadPrefs()).toEqual({ enabled: false, modifiers: [...DEFAULT_PREFS.modifiers] })
  localStorage.setItem('dsh-insight/inspector', 'not json')
  expect(loadPrefs()).toEqual(DEFAULT_PREFS)
})

it('修饰键顺序归一化（存的顺序不影响判定与显示）', () => {
  savePrefs({ enabled: true, modifiers: ['shift', 'meta'] })
  expect(loadPrefs().modifiers).toEqual(['meta', 'shift'])
})
