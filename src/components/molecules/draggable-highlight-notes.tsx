"use client"

import { useRef } from "react"

import { BentoStatCard } from "@/components/atoms/bento-stat-card"
import { DraggableSticker } from "@/components/atoms/draggable-sticker"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const NOTE_TILTS = [-2, 1.5, -1, 2] as const
const NOTE_OFFSETS = [
  { top: 0, left: 3 },
  { top: 6, left: -3 },
  { top: -4, left: 4 },
  { top: 5, left: -4 },
  { top: -5, left: 3 },
  { top: 3, left: -3 },
  { top: 6, left: 2 },
  { top: -3, left: -2 },
] as const

type DraggableHighlightNotesProps = {
  highlights: readonly string[]
  label: string
}

/**
 * Square project notes that share the hero collage's paper-card drag behavior.
 */
export function DraggableHighlightNotes({
  highlights,
  label,
}: DraggableHighlightNotesProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const isMdUp = useMediaQuery("(min-width: 768px)")

  return (
    <div
      ref={constraintsRef}
      role="group"
      aria-label={label}
      className="relative flex flex-wrap content-start gap-3 overflow-hidden p-2"
    >
      {highlights.map((text, index) => {
        const noteNumber = String(index + 1).padStart(2, "0")

        return (
          <DraggableSticker
            key={text}
            aria-label={`${noteNumber}. ${text}`}
            dragConstraints={constraintsRef}
            dragEnabled={isMdUp}
            initialRotate={NOTE_TILTS[index % NOTE_TILTS.length]}
            layout="relative"
            className="size-[clamp(9rem,18vw,11rem)] shrink-0"
            style={NOTE_OFFSETS[index % NOTE_OFFSETS.length]}
          >
            <BentoStatCard
              variant="primary"
              title={noteNumber}
              className="content-start gap-2 p-3"
            >
              <p
                className={cn(
                  "font-handwriting font-medium tracking-wide text-primary-foreground",
                  text.length > 140
                    ? "text-xs leading-[1.15]"
                    : "text-sm leading-[1.15] sm:text-[15px]"
                )}
              >
                {text}
              </p>
            </BentoStatCard>
          </DraggableSticker>
        )
      })}
    </div>
  )
}
