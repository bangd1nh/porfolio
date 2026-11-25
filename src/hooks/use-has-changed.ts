"use client"

import { useState } from "react"

/**
 * True once `value` has differed from its first-render value. Lets keyed
 * enter animations skip the initial mount (like AnimatePresence initial={false})
 * without reading refs during render.
 */
export function useHasChanged<T>(value: T): boolean {
  const [state, setState] = useState({ initial: value, changed: false })
  if (!state.changed && !Object.is(value, state.initial)) {
    setState({ initial: state.initial, changed: true })
    return true
  }
  return state.changed
}
