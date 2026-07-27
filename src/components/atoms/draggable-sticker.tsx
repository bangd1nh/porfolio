"use client"

import {
  animate,
  motion,
  useMotionValue,
  type Transition,
} from "framer-motion"
import type { RefObject } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
}

type DraggableStickerProps = {
  children?: React.ReactNode
  className?: string
  /** Slight paper-note tilt in degrees (e.g. -3 … 3). */
  initialRotate?: number
  dragConstraints: RefObject<HTMLElement | null>
  /** When false, sticker is static (e.g. mobile). */
  dragEnabled?: boolean
  style?: React.CSSProperties
  "aria-label"?: string
}

/**
 * Absolute sticker that can be dragged within a constraint frame.
 * Double-click / double-tap resets to the original layout position.
 * Honors prefers-reduced-motion (no tilt / hover scale).
 */
export function DraggableSticker({
  children,
  className,
  initialRotate = 0,
  dragConstraints,
  dragEnabled = true,
  style,
  "aria-label": ariaLabel,
}: DraggableStickerProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const canAnimate = dragEnabled && !reducedMotion
  const rotate = reducedMotion ? 0 : initialRotate
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const resetPosition = () => {
    animate(x, 0, spring)
    animate(y, 0, spring)
  }

  return (
    <motion.div
      role={canAnimate ? "button" : undefined}
      tabIndex={canAnimate ? 0 : undefined}
      aria-label={ariaLabel}
      drag={canAnimate}
      dragConstraints={dragConstraints}
      dragElastic={0.15}
      dragMomentum={canAnimate}
      dragTransition={{
        power: 0.3,
        timeConstant: 280,
        bounceStiffness: 300,
        bounceDamping: 20,
      }}
      style={{ ...style, x, y, rotate }}
      transition={spring}
      whileHover={
        canAnimate
          ? {
              scale: 1.03,
              rotate: rotate + (rotate >= 0 ? 1 : -1),
              boxShadow: "7px 9px 0 0 oklch(0 0 0 / 0.18)",
            }
          : undefined
      }
      whileDrag={
        canAnimate
          ? {
              scale: 1.05,
              zIndex: 50,
              cursor: "grabbing",
              boxShadow: "10px 12px 0 0 oklch(0 0 0 / 0.22)",
            }
          : undefined
      }
      onDoubleClick={canAnimate ? resetPosition : undefined}
      onKeyDown={
        canAnimate
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                resetPosition()
              }
            }
          : undefined
      }
      className={cn(
        "absolute touch-none select-none transition-[box-shadow] duration-200",
        canAnimate && "cursor-grab focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      {children}
    </motion.div>
  )
}
