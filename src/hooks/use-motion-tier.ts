"use client"

import { useSyncExternalStore } from "react"

import { getMotionTier, type MotionTier } from "@/lib/motion-tier"

const noopSubscribe = () => () => {}

/**
 * Motion tier resolved before first paint (see MOTION_TIER_SCRIPT). It never
 * changes during a session, so there is nothing to subscribe to. SSR snapshot
 * is "full"; the client corrects it right after hydration.
 */
export function useMotionTier(): MotionTier {
  return useSyncExternalStore(noopSubscribe, getMotionTier, () => "full")
}
