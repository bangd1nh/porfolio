"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useMotionTier } from "@/hooks/use-motion-tier"

gsap.registerPlugin(useGSAP)

const INTERACTIVE = "a, button, summary, label, [role='button'], [data-cursor]"
const LABELLED = "[data-cursor-label]"

/**
 * Dot + trailing ring cursor. Blend-difference keeps it legible on any theme;
 * it swells over interactive targets and turns into a labelled yellow disc
 * over elements that opt in with data-cursor-label (data-cursor-tone="dark"
 * swaps to an ink disc for yellow surfaces). Fine pointers only.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const finePointer = useMediaQuery("(pointer: fine)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Two blended, always-moving fixed layers are costly to composite in
  // software — lite-tier machines keep the native cursor.
  const lite = useMotionTier() === "lite"
  const enabled = finePointer && !reducedMotion && !lite

  useGSAP(
    () => {
      const ring = ringRef.current
      const dot = dotRef.current
      const label = labelRef.current
      if (!ring || !dot || !label || !enabled) return

      const root = document.documentElement
      root.classList.add("has-custom-cursor")

      const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" })
      const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" })
      const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" })
      const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" })
      let pointerX = -100
      let pointerY = -100

      const setState = (state: string) => {
        ring.dataset.state = state
        dot.dataset.state = state
      }

      const sync = (hit: Element | null) => {
        const labelled = hit?.closest<HTMLElement>(LABELLED)
        if (labelled?.dataset.cursorLabel) {
          if (label.textContent !== labelled.dataset.cursorLabel) {
            label.textContent = labelled.dataset.cursorLabel
          }
          setState("label")
          ring.dataset.tone = labelled.dataset.cursorTone ?? ""
        } else {
          setState(hit?.closest(INTERACTIVE) ? "hover" : "idle")
          ring.dataset.tone = ""
        }
      }

      const setVisible = (visible: boolean) => {
        const value = String(visible)
        ring.dataset.visible = value
        dot.dataset.visible = value
      }

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return
        pointerX = event.clientX
        pointerY = event.clientY
        ringX(pointerX)
        ringY(pointerY)
        dotX(pointerX)
        dotY(pointerY)
        setVisible(true)
        // The cursor layers are pointer-events: none, so the event target is
        // what sits under the pointer — no hit-test needed per move.
        sync(event.target instanceof Element ? event.target : null)
      }
      // Scrolling moves content under a still pointer: hit-test once per frame.
      let scrollFrame = 0
      const onScroll = () => {
        if (scrollFrame) return
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0
          sync(document.elementFromPoint(pointerX, pointerY))
        })
      }
      const onDown = () => {
        ring.dataset.pressed = "true"
      }
      const onUp = () => {
        ring.dataset.pressed = "false"
      }
      const onLeave = () => setVisible(false)

      gsap.set([ring, dot], { x: pointerX, y: pointerY })
      window.addEventListener("pointermove", onMove, { passive: true })
      window.addEventListener("scroll", onScroll, { passive: true })
      window.addEventListener("pointerdown", onDown)
      window.addEventListener("pointerup", onUp)
      root.addEventListener("pointerleave", onLeave)

      return () => {
        root.classList.remove("has-custom-cursor")
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("scroll", onScroll)
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
        window.removeEventListener("pointerdown", onDown)
        window.removeEventListener("pointerup", onUp)
        root.removeEventListener("pointerleave", onLeave)
      }
    },
    { dependencies: [enabled], revertOnUpdate: true }
  )

  if (!enabled) return null

  return (
    <>
      <div ref={ringRef} aria-hidden data-state="idle" data-visible="false" className="cursor">
        <span className="cursor-ring" />
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} aria-hidden data-state="idle" data-visible="false" className="cursor-dot" />
    </>
  )
}
