"use client"

import { useRef, type CSSProperties } from "react"

import { BentoStatCard } from "@/components/atoms/bento-stat-card"
import { DraggableSticker } from "@/components/atoms/draggable-sticker"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const NOTE_SLOTS = [
  { x: 1, y: 1, layer: 3 },
  { x: 24, y: 4, layer: 6 },
  { x: 48, y: 0, layer: 2 },
  { x: 72, y: 10, layer: 5 },
  { x: 3, y: 48, layer: 7 },
  { x: 27, y: 43, layer: 4 },
  { x: 52, y: 50, layer: 8 },
  { x: 75, y: 40, layer: 1 },
] as const

const NOTE_TILTS = [-3, 2, -1.5, 3, 1, -2.5, 2.5, -1] as const
const COPRIME_STEPS = [3, 5, 7] as const

type NotePositionStyle = CSSProperties & {
  "--note-left": string
  "--note-top": string
  "--note-layer": number
}

type DraggableHighlightNotesProps = {
  projectId: string
  highlights: readonly string[]
  label: string
}

function hashString(value: string): number {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function getNoteLayout(projectId: string, index: number) {
  const projectHash = hashString(projectId)
  const noteHash = hashString(`${projectId}:${index}`)
  const step = COPRIME_STEPS[projectHash % COPRIME_STEPS.length]
  const slotIndex = (projectHash + index * step) % NOTE_SLOTS.length
  const slot = NOTE_SLOTS[slotIndex]
  const xJitter = (noteHash % 7) - 3
  const yJitter = (Math.floor(noteHash / 7) % 7) - 3
  const tiltIndex = (projectHash + index) % NOTE_TILTS.length

  return {
    x: Math.max(0, Math.min(78, slot.x + xJitter)),
    y: Math.max(0, Math.min(50, slot.y + yJitter)),
    layer: slot.layer,
    tilt: NOTE_TILTS[tiltIndex],
  }
}

/**
 * Two-note-high board: horizontal two-row strip on mobile/tablet, seeded collage on desktop.
 */
export function DraggableHighlightNotes({
  projectId,
  highlights,
  label,
}: DraggableHighlightNotesProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div
      ref={constraintsRef}
      role="group"
      aria-label={label}
      className={cn(
        "relative grid h-[calc(var(--note-mobile-size)*2+0.75rem)] grid-flow-col grid-rows-2 content-start gap-3 overflow-x-auto overflow-y-hidden p-1.5",
        "[--note-mobile-size:8.5rem] [--note-size:clamp(7rem,14svh,9.5rem)] [grid-auto-columns:var(--note-mobile-size)]",
        "overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "lg:block lg:h-[calc(var(--note-size)*2)] lg:overflow-hidden lg:p-0"
      )}
    >
      {highlights.map((text, index) => {
        const noteNumber = String(index + 1).padStart(2, "0")
        const layout = getNoteLayout(projectId, index)
        const positionStyle: NotePositionStyle = {
          "--note-left": `clamp(0px, ${layout.x}%, calc(100% - var(--note-size)))`,
          "--note-top": `clamp(0px, ${layout.y}%, calc(100% - var(--note-size)))`,
          "--note-layer": layout.layer,
        }

        return (
          <DraggableSticker
            key={text}
            aria-label={`${noteNumber}. ${text}`}
            dragConstraints={constraintsRef}
            dragEnabled={isDesktop}
            initialRotate={layout.tilt}
            layout="relative"
            className={cn(
              "size-[var(--note-mobile-size)] shrink-0",
              "lg:absolute lg:top-[var(--note-top)] lg:left-[var(--note-left)] lg:z-[var(--note-layer)] lg:size-[var(--note-size)]"
            )}
            style={positionStyle}
          >
            <BentoStatCard
              variant="primary"
              title={noteNumber}
              className="content-start gap-2 p-3"
            >
              <p
                className={cn(
                  "font-handwriting font-medium tracking-wide text-primary-foreground",
                  text.length > 110
                    ? "text-[10px] leading-[1.08] sm:text-[11px]"
                    : text.length > 80
                      ? "text-[11px] leading-[1.1] sm:text-xs"
                      : "text-xs leading-[1.12] sm:text-sm"
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
