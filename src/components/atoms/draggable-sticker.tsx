"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { useRef, type RefObject } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin)

type DraggableStickerProps = {
  children?: React.ReactNode
  className?: string
  /** Slight paper-note tilt in degrees (e.g. -3 … 3). */
  initialRotate?: number
  dragConstraints: RefObject<HTMLElement | null>
  /** When false, sticker is static (e.g. mobile). */
  dragEnabled?: boolean
  /** Absolute for collages; relative keeps the sticker in a grid slot. */
  layout?: "absolute" | "relative"
  style?: React.CSSProperties
  "aria-label"?: string
}

/**
 * Absolute sticker that can be dragged within a constraint frame (GSAP
 * Draggable + inertia). Double-click / double-tap / Enter resets it to the
 * original layout position. Honors prefers-reduced-motion (no tilt / hover
 * scale). GSAP owns the transform; the lift shadow is CSS via data-state.
 */
export function DraggableSticker({
  children,
  className,
  initialRotate = 0,
  dragConstraints,
  dragEnabled = true,
  layout = "absolute",
  style,
  "aria-label": ariaLabel,
}: DraggableStickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const canAnimate = dragEnabled && !reducedMotion
  const rotate = reducedMotion ? 0 : initialRotate

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      gsap.set(el, { rotation: rotate })
      if (!canAnimate) return

      const tilt = rotate + (rotate >= 0 ? 1 : -1)
      const baseZ = el.style.zIndex
      let dragging = false

      const settle = (hovered: boolean) => {
        el.dataset.state = hovered ? "hover" : ""
        gsap.to(el, {
          scale: hovered ? 1.03 : 1,
          rotation: hovered ? tilt : rotate,
          duration: 0.35,
          ease: "back.out(2)",
          overwrite: "auto",
        })
      }
      const onEnter = () => {
        if (!dragging) settle(true)
      }
      const onLeave = () => {
        if (!dragging) settle(false)
      }
      const reset = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.6)",
          overwrite: "auto",
          onUpdate: () => {
            Draggable.get(el)?.update()
          },
        })
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        reset()
      }

      el.addEventListener("pointerenter", onEnter)
      el.addEventListener("pointerleave", onLeave)
      el.addEventListener("dblclick", reset)
      el.addEventListener("keydown", onKeyDown)

      const [draggable] = Draggable.create(el, {
        type: "x,y",
        bounds: dragConstraints.current ?? undefined,
        edgeResistance: 0.85,
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        zIndexBoost: false,
        onDragStart() {
          dragging = true
          el.dataset.state = "drag"
          el.style.zIndex = "50"
          gsap.to(el, { scale: 1.05, duration: 0.2, ease: "power2.out", overwrite: "auto" })
        },
        onDragEnd() {
          dragging = false
          el.style.zIndex = baseZ
          settle(el.matches(":hover"))
        },
      })

      return () => {
        draggable?.kill()
        el.removeEventListener("pointerenter", onEnter)
        el.removeEventListener("pointerleave", onLeave)
        el.removeEventListener("dblclick", reset)
        el.removeEventListener("keydown", onKeyDown)
        el.style.zIndex = baseZ
        delete el.dataset.state
      }
    },
    { dependencies: [canAnimate, rotate], revertOnUpdate: true }
  )

  return (
    <div
      ref={ref}
      role={canAnimate ? "button" : undefined}
      tabIndex={canAnimate ? 0 : undefined}
      aria-label={ariaLabel}
      // Tilt in the server markup so it does not snap in after hydration;
      // GSAP parses it and owns the transform from then on.
      style={{ ...style, transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      className={cn(
        "draggable-sticker transition-[box-shadow] duration-200",
        layout === "absolute" ? "absolute" : "relative",
        canAnimate &&
          "cursor-grab touch-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      {children}
    </div>
  )
}
