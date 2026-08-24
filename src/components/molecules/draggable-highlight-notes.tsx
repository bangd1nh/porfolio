"use client"

import { useRef, type CSSProperties } from "react"

import { BentoStatCard } from "@/components/atoms/bento-stat-card"
import { DraggableSticker } from "@/components/atoms/draggable-sticker"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const NOTE_SLOTS = [
  { x: 2, y: 4, layer: 3 },
  { x: 26, y: 7, layer: 6 },
  { x: 50, y: 3, layer: 2 },
  { x: 74, y: 9, layer: 5 },
  { x: 4, y: 50, layer: 7 },
  { x: 28, y: 46, layer: 4 },
  { x: 52, y: 52, layer: 8 },
  { x: 76, y: 44, layer: 1 },
] as const

const NOTE_TILTS = [-3, 2, -1.5, 3, 1, -2.5, 2.5, -1] as const
const COPRIME_STEPS = [3, 5, 7] as const

type NotePositionStyle = CSSProperties & {
  "--note-size": string
  "--note-left": string
  "--note-top": string
  "--note-layer": number
}

type DraggableHighlightNotesProps = {
  projectId: string
  highlights: readonly { label: string; text: string }[]
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
 * Two-row strip on mobile/tablet; desktop collage sizes notes from the board
 * (container query) so 150% OS scale / short laptops do not clip the stack.
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
        "[--note-mobile-size:13.5rem] [grid-auto-columns:var(--note-mobile-size)]",
        "overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "lg:block lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-0 lg:[container-type:size]"
      )}
    >
      {highlights.map(({ label: noteLabel, text }, index) => {
        const layout = getNoteLayout(projectId, index)
        const positionStyle: NotePositionStyle = {
          "--note-size": "min(40.5cqw, 78cqh, 15.75rem)",
          "--note-left": `clamp(0.25rem, ${layout.x}%, calc(100% - var(--note-size) - 0.25rem))`,
          "--note-top": `clamp(0.25rem, ${layout.y}%, calc(100% - var(--note-size) - 0.25rem))`,
          "--note-layer": layout.layer,
        }

        return (
          <DraggableSticker
            key={noteLabel}
            aria-label={`${noteLabel}: ${text}`}
            dragConstraints={constraintsRef}
            dragEnabled={isDesktop}
            initialRotate={layout.tilt}
            layout="relative"
            className={cn(
              "size-[var(--note-mobile-size)] shrink-0",
              "lg:absolute lg:top-[var(--note-top)] lg:left-[var(--note-left)] lg:z-[var(--note-layer)] lg:size-[var(--note-size)] lg:@container"
            )}
            style={positionStyle}
          >
            <BentoStatCard
              variant="primary"
              className="content-start p-3 sm:p-3.5 lg:p-[clamp(0.6rem,6%,0.9rem)]"
            >
              <span className="mb-1.5 block font-mono text-[10px] font-bold tracking-[0.08em] text-primary-foreground/70 uppercase sm:text-[11px]">
                {noteLabel}
              </span>
              <p
                className={cn(
                  "line-clamp-6 font-handwriting font-medium tracking-wide break-words text-primary-foreground",
                  "lg:text-[clamp(0.8125rem,9cqh,1rem)] lg:leading-[1.2] lg:@max-[8.5rem]:line-clamp-5",
                  text.length > 110
                    ? "text-xs leading-[1.15] sm:text-[13px]"
                    : text.length > 80
                      ? "text-[13px] leading-[1.18] sm:text-sm"
                      : "text-sm leading-[1.2] sm:text-[15px]"
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
