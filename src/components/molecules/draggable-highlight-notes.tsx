"use client"

import { useRef, type CSSProperties } from "react"

import { BentoStatCard } from "@/components/atoms/bento-stat-card"
import { DraggableSticker } from "@/components/atoms/draggable-sticker"
import { useElementHasSize } from "@/hooks/use-element-has-size"
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
  /** Desktop: equal columns in a row (readable), vertical stack, overlapping collage, or rail drawer board. */
  layout?: "collage" | "strip" | "stack"
  /** Rail drawer: collage board clipped to panel height. */
  density?: "default" | "rail"
  className?: string
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
 * One-row strip on mobile/tablet; desktop collage sizes notes from the board
 * (container query) so 150% OS scale / short laptops do not clip the stack.
 */
export function DraggableHighlightNotes({
  projectId,
  highlights,
  label,
  layout = "collage",
  density = "default",
  className,
}: DraggableHighlightNotesProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const panelReady = useElementHasSize(constraintsRef, 48)
  const isStrip = layout === "strip"
  const isStack = layout === "stack"
  const isRail = density === "rail"
  const isRowDesktop = isStrip && !isStack && !isRail

  if (isRail) {
    return (
      <div
        ref={constraintsRef}
        role="group"
        aria-label={label}
        className={cn(
          "relative h-full w-full min-h-0 overflow-hidden [container-type:size]",
          className
        )}
      >
        {highlights.map(({ label: noteLabel, text }, index) => {
          const noteLayout = getNoteLayout(projectId, index)
          const positionStyle: NotePositionStyle = {
            "--note-size": "min(52cqw, 84cqh, 17rem)",
            "--note-left": `clamp(0.25rem, ${noteLayout.x}%, calc(100% - var(--note-size) - 0.25rem))`,
            "--note-top": `clamp(0.25rem, ${noteLayout.y}%, calc(100% - var(--note-size) - 0.25rem))`,
            "--note-layer": noteLayout.layer,
          }

          return (
            <DraggableSticker
              key={noteLabel}
              aria-label={`${noteLabel}: ${text}`}
              dragConstraints={constraintsRef}
              dragEnabled={isDesktop && panelReady}
              initialRotate={noteLayout.tilt}
              layout="absolute"
              className="absolute top-[var(--note-top)] left-[var(--note-left)] z-[var(--note-layer)] size-[var(--note-size)] @container lg:touch-none"
              style={positionStyle}
            >
              <BentoStatCard
                variant="primary"
                className="grid size-full min-h-0 grid-rows-[auto_minmax(0,1fr)] content-start gap-1.5 p-[clamp(0.6rem,6%,1rem)]"
              >
                <span className="block font-mono text-[10px] font-bold tracking-[0.08em] text-primary-foreground/70 uppercase leading-tight">
                  {noteLabel}
                </span>
                <p className="min-h-0 overflow-hidden font-handwriting text-sm font-medium leading-[1.35] tracking-wide text-primary-foreground sm:text-[15px]">
                  {text}
                </p>
              </BentoStatCard>
            </DraggableSticker>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={constraintsRef}
      role="group"
      aria-label={label}
      className={cn(
        "relative grid h-[calc(var(--note-mobile-size)+0.75rem)] grid-flow-col grid-rows-1 content-start gap-3 overflow-x-auto overflow-y-hidden p-1.5",
        "[--note-mobile-size:13.5rem] [grid-auto-columns:var(--note-mobile-size)]",
        "overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        isStack &&
          "h-auto grid-flow-row grid-cols-1 grid-rows-none gap-3 overflow-visible p-0 lg:flex lg:h-auto lg:min-h-0 lg:flex-col lg:items-stretch lg:gap-3 lg:overflow-visible lg:p-0",
        isStrip &&
          "lg:flex lg:h-full lg:min-h-0 lg:flex-row lg:items-start lg:content-start lg:gap-3 lg:overflow-hidden lg:p-0",
        !isStrip &&
          !isStack &&
          "lg:block lg:h-full lg:min-h-0 lg:overflow-hidden lg:p-0 lg:[container-type:size]",
        className
      )}
    >
      {highlights.map(({ label: noteLabel, text }, index) => {
        const noteLayout = getNoteLayout(projectId, index)
        const positionStyle: NotePositionStyle = {
          "--note-size": "min(40.5cqw, 78cqh, 15.75rem)",
          "--note-left": `clamp(0.25rem, ${noteLayout.x}%, calc(100% - var(--note-size) - 0.25rem))`,
          "--note-top": `clamp(0.25rem, ${noteLayout.y}%, calc(100% - var(--note-size) - 0.25rem))`,
          "--note-layer": noteLayout.layer,
        }

        return (
          <DraggableSticker
            key={noteLabel}
            aria-label={`${noteLabel}: ${text}`}
            dragConstraints={constraintsRef}
            dragEnabled={isDesktop}
            initialRotate={noteLayout.tilt}
            layout="relative"
            className={cn(
              "shrink-0",
              isStack
                ? "size-[var(--note-mobile-size)] w-full lg:h-auto lg:w-full lg:touch-none"
                : isStrip
                  ? "size-[var(--note-mobile-size)] lg:h-auto lg:w-auto lg:flex-1 lg:basis-0 lg:min-w-[11rem] lg:max-h-full lg:touch-none"
                  : "size-[var(--note-mobile-size)] lg:absolute lg:top-[var(--note-top)] lg:left-[var(--note-left)] lg:z-[var(--note-layer)] lg:size-[var(--note-size)] lg:@container"
            )}
            style={isRowDesktop && isDesktop ? undefined : positionStyle}
          >
            <BentoStatCard
              variant="primary"
              className={cn(
                "content-start p-3 sm:p-3.5",
                isStack || isStrip
                  ? "h-auto w-full lg:p-4"
                  : "size-full lg:p-[clamp(0.6rem,6%,0.9rem)]"
              )}
            >
              <span
                className={cn(
                  "mb-1.5 block font-mono font-bold tracking-[0.08em] text-primary-foreground/70 uppercase",
                  "text-[10px] sm:text-[11px]"
                )}
              >
                {noteLabel}
              </span>
              <p
                className={cn(
                  "font-handwriting font-medium tracking-wide break-words text-primary-foreground",
                  isStack
                    ? "text-sm leading-snug sm:text-[15px] lg:text-base lg:leading-relaxed"
                    : isStrip
                      ? "text-sm leading-snug sm:text-[15px] lg:max-h-[min(18rem,100%)] lg:overflow-y-auto lg:text-base lg:leading-relaxed"
                      : cn(
                          "line-clamp-6",
                          "lg:text-[clamp(0.8125rem,9cqh,1rem)] lg:leading-[1.2] lg:@max-[8.5rem]:line-clamp-5",
                          text.length > 110
                            ? "text-xs leading-[1.15] sm:text-[13px]"
                            : text.length > 80
                              ? "text-[13px] leading-[1.18] sm:text-sm"
                              : "text-sm leading-[1.2] sm:text-[15px]"
                        )
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
