"use client"

import Matter from "matter-js"
import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { buildBlocks } from "@/data/build-blocks"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

type BuildBlocksStageProps = {
  className?: string
}

type BlockPose = {
  x: number
  y: number
  angle: number
}

type PhysicsRefs = {
  engine: Matter.Engine
  bodiesById: Map<string, Matter.Body>
  walls: Matter.Body[]
}

type DragState = {
  id: string
  pointerId: number
  constraint: Matter.Constraint
  samples: Array<{ x: number; y: number; t: number }>
}

const WALL_INSET = 10

/**
 * Physics stage — gravity pile + corner-grab swing via Matter constraints.
 */
export function BuildBlocksStage({ className }: BuildBlocksStageProps) {
  const t = useTranslations("contact.blocks")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const containerRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Map<string, HTMLSpanElement>>(new Map())
  const physicsRef = useRef<PhysicsRefs | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [poses, setPoses] = useState<Record<string, BlockPose>>({})
  const [ready, setReady] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    if (reducedMotion) return

    const container = containerRef.current
    if (!container) return

    const { Engine, World, Bodies, Runner, Events, Composite } = Matter

    const engine = Engine.create({
      gravity: { x: 0, y: 1.05, scale: 0.001 },
    })
    engine.positionIterations = 16
    engine.velocityIterations = 12
    engine.constraintIterations = 4
    engine.enableSleeping = true

    const runner = Runner.create()
    const bodiesById = new Map<string, Matter.Body>()
    const physics: PhysicsRefs = { engine, bodiesById, walls: [] }
    physicsRef.current = physics

    let frame = 0

    const syncPoses = () => {
      const next: Record<string, BlockPose> = {}
      for (const block of buildBlocks) {
        const body = bodiesById.get(block.id)
        if (!body) continue
        next[block.id] = {
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
        }
      }
      setPoses(next)
    }

    const removeDynamic = () => {
      if (dragRef.current) {
        Composite.remove(engine.world, dragRef.current.constraint)
        dragRef.current = null
        setDraggingId(null)
      }
      for (const body of bodiesById.values()) {
        Composite.remove(engine.world, body)
      }
      bodiesById.clear()
      for (const wall of physics.walls) {
        Composite.remove(engine.world, wall)
      }
      physics.walls = []
    }

    const buildWalls = (width: number, height: number) => {
      const thickness = 120
      const inset = WALL_INSET
      // Inner faces sit inset so chips never visually clip the stage edge.
      physics.walls = [
        Bodies.rectangle(
          width / 2,
          height - inset + thickness / 2,
          width + 400,
          thickness,
          { isStatic: true, friction: 0.95, restitution: 0.05, label: "floor" }
        ),
        Bodies.rectangle(
          inset - thickness / 2,
          height / 2,
          thickness,
          height * 2,
          { isStatic: true, friction: 0.9, label: "wall-left" }
        ),
        Bodies.rectangle(
          width - inset + thickness / 2,
          height / 2,
          thickness,
          height * 2,
          { isStatic: true, friction: 0.9, label: "wall-right" }
        ),
        Bodies.rectangle(
          width / 2,
          inset - thickness / 2,
          width + 400,
          thickness,
          { isStatic: true, label: "ceiling" }
        ),
      ]
      World.add(engine.world, physics.walls)
    }

    const measureChip = (el: HTMLElement) => {
      // offset* ignores CSS transforms — critical after blocks start rotating.
      const chipW = Math.max(el.offsetWidth, 64)
      const chipH = Math.max(el.offsetHeight, 40)
      // Tiny pad so faces don't visually kiss / clip into text.
      return { chipW: chipW + 6, chipH: chipH + 6 }
    }

    const spawnBlocks = (width: number) => {
      const margin = WALL_INSET + 36
      for (const [index, block] of buildBlocks.entries()) {
        const el = chipRefs.current.get(block.id)
        if (!el) continue

        const { chipW, chipH } = measureChip(el)
        const isVertical = block.orientation === "vertical"
        const halfSpan = Math.max(chipW, chipH) / 2 + 8

        const x = Math.min(
          width - margin - halfSpan,
          Math.max(margin + halfSpan, width * block.spawnX)
        )
        // Drop from staggered heights so they settle into a pile instead of spawning overlapped.
        const y = margin + 18 + index * 10
        const angle = isVertical
          ? Math.PI / 2 + (Math.random() - 0.5) * 0.08
          : (Math.random() - 0.5) * 0.25

        const body = Bodies.rectangle(x, y, chipW, chipH, {
          restitution: 0.04,
          friction: 0.55,
          frictionStatic: 0.85,
          frictionAir: 0.02,
          density: 0.0024,
          angle,
          label: block.id,
          sleepThreshold: 28,
          slop: 0,
          chamfer: { radius: 0 },
        })

        bodiesById.set(block.id, body)
        World.add(engine.world, body)
      }
    }

    const rebuild = () => {
      if (dragRef.current) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width < 40 || height < 40) return

      removeDynamic()
      buildWalls(width, height)
      spawnBlocks(width)
      syncPoses()
      setReady(true)
    }

    const boot = window.requestAnimationFrame(() => {
      // Second frame: layout + font metrics are settled for offsetWidth.
      window.requestAnimationFrame(() => {
        rebuild()
        Runner.run(runner, engine)
        // Remeasure once more after chips become visible (font/layout).
        window.setTimeout(() => {
          if (!dragRef.current) rebuild()
        }, 120)
      })
    })

    Events.on(engine, "afterUpdate", () => {
      frame += 1
      if (frame % 2 === 0) syncPoses()
    })

    const resizeObserver = new ResizeObserver(() => {
      rebuild()
    })
    resizeObserver.observe(container)

    return () => {
      window.cancelAnimationFrame(boot)
      resizeObserver.disconnect()
      Events.off(engine, "afterUpdate")
      Runner.stop(runner)
      World.clear(engine.world, false)
      Engine.clear(engine)
      physicsRef.current = null
      dragRef.current = null
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "flex min-h-48 w-full flex-wrap content-end items-end justify-center gap-2 py-4 md:gap-3",
          className
        )}
      >
        {buildBlocks.map((block) => (
          <span
            key={block.id}
            className={cn(
              "inline-flex items-center justify-center border border-border bg-card px-5 py-3",
              "font-sans text-sm font-bold tracking-widest text-foreground uppercase",
              "shadow-[4px_5px_0_0_oklch(0_0_0_/_0.12)] dark:shadow-[4px_5px_0_0_oklch(0_0_0_/_0.35)]"
            )}
          >
            {t(block.labelKey)}
          </span>
        ))}
      </div>
    )
  }

  const pointerToLocal = (event: React.PointerEvent) => {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0 }
    const bounds = container.getBoundingClientRect()
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    }
  }

  const worldToBodyLocal = (
    body: Matter.Body,
    worldX: number,
    worldY: number
  ) => {
    const dx = worldX - body.position.x
    const dy = worldY - body.position.y
    const cos = Math.cos(-body.angle)
    const sin = Math.sin(-body.angle)
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    }
  }

  const clampPoint = (x: number, y: number) => {
    const container = containerRef.current
    if (!container) return { x, y }
    const pad = WALL_INSET + 4
    return {
      x: Math.min(container.clientWidth - pad, Math.max(pad, x)),
      y: Math.min(container.clientHeight - pad, Math.max(pad, y)),
    }
  }

  const onPointerDown = (
    id: string,
    event: React.PointerEvent<HTMLSpanElement>
  ) => {
    const physics = physicsRef.current
    const body = physics?.bodiesById.get(id)
    if (!physics || !body) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    Matter.Sleeping.set(body, false)

    const local = pointerToLocal(event)
    const pointB = worldToBodyLocal(body, local.x, local.y)
    const pointA = clampPoint(local.x, local.y)

    const constraint = Matter.Constraint.create({
      pointA,
      bodyB: body,
      pointB,
      stiffness: 0.12,
      damping: 0.08,
      length: 0,
    })

    Matter.Composite.add(physics.engine.world, constraint)

    dragRef.current = {
      id,
      pointerId: event.pointerId,
      constraint,
      samples: [{ x: pointA.x, y: pointA.y, t: performance.now() }],
    }
    setDraggingId(id)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const local = clampPoint(pointerToLocal(event).x, pointerToLocal(event).y)
    drag.constraint.pointA.x = local.x
    drag.constraint.pointA.y = local.y

    const now = performance.now()
    drag.samples.push({ x: local.x, y: local.y, t: now })
    if (drag.samples.length > 8) drag.samples.shift()
  }

  const endDrag = (event: React.PointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current
    const physics = physicsRef.current
    if (!drag || drag.pointerId !== event.pointerId || !physics) return

    const body = physics.bodiesById.get(drag.id)
    Matter.Composite.remove(physics.engine.world, drag.constraint)

    if (body) {
      Matter.Sleeping.set(body, false)

      const samples = drag.samples
      let vx = 0
      let vy = 0

      if (samples.length >= 2) {
        const last = samples[samples.length - 1]
        let first = samples[0]
        for (let i = samples.length - 2; i >= 0; i -= 1) {
          first = samples[i]
          if (last.t - first.t >= 90) break
        }

        const dt = Math.max(last.t - first.t, 16)
        const scale = (1000 / 60 / dt) * 1.25
        vx = (last.x - first.x) * scale
        vy = (last.y - first.y) * scale

        const maxSpeed = 44
        const speed = Math.hypot(vx, vy)
        if (speed > maxSpeed) {
          const k = maxSpeed / speed
          vx *= k
          vy *= k
        }
      }

      // Keep natural constraint-born motion, then blend in flick impulse.
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * 0.35 + vx,
        y: body.velocity.y * 0.35 + vy,
      })
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // already released
    }

    dragRef.current = null
    setDraggingId(null)
  }

  const chipClassName = cn(
    "inline-flex items-center justify-center border border-border bg-card px-6 py-3.5 md:px-7 md:py-4",
    "font-sans text-sm font-bold tracking-widest text-foreground uppercase whitespace-nowrap md:text-base",
    "shadow-[6px_7px_0_0_oklch(0_0_0_/_0.14)] dark:shadow-[6px_7px_0_0_oklch(0_0_0_/_0.4)]"
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[42vh] w-full min-h-48 overflow-hidden md:h-[46vh]",
        className
      )}
    >
      {/* Visible until physics settles — avoids empty dark stage */}
      {!ready ? (
        <div
          className="absolute inset-0 flex flex-wrap content-end items-end justify-center gap-2 p-4 md:gap-3"
          aria-hidden
        >
          {buildBlocks.map((block) => (
            <span key={`pending-${block.id}`} className={chipClassName}>
              {t(block.labelKey)}
            </span>
          ))}
        </div>
      ) : null}

      {/* Off-flow measure layer for Matter body sizes */}
      <div
        className="pointer-events-none absolute top-0 left-0 -z-10 flex flex-wrap opacity-0"
        aria-hidden
      >
        {buildBlocks.map((block) => (
          <span
            key={`measure-${block.id}`}
            ref={(node) => {
              if (node) chipRefs.current.set(block.id, node)
              else chipRefs.current.delete(block.id)
            }}
            className={chipClassName}
          >
            {t(block.labelKey)}
          </span>
        ))}
      </div>

      {ready
        ? buildBlocks.map((block) => {
            const label = t(block.labelKey)
            const pose = poses[block.id]
            if (!pose) return null
            const isDragging = draggingId === block.id

            return (
              <span
                key={block.id}
                role="button"
                tabIndex={0}
                aria-label={label}
                onPointerDown={(event) => onPointerDown(block.id, event)}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(
                  chipClassName,
                  "absolute top-0 left-0 touch-none select-none will-change-transform",
                  "transition-shadow duration-200",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  transform: `translate3d(${pose.x}px, ${pose.y}px, 0) translate(-50%, -50%) rotate(${pose.angle}rad)`,
                  zIndex: isDragging ? 20 : 2,
                }}
              >
                {label}
              </span>
            )
          })
        : null}
    </div>
  )
}
