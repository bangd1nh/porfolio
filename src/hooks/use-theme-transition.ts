"use client"

import { useThemeTransitionContext } from "@/components/providers/theme-transition"

/**
 * Circular theme reveal — View Transition API with overlay fallback.
 * Requires `<ThemeTransition>` inside ThemeProvider.
 */
export function useThemeTransition() {
  return useThemeTransitionContext()
}
