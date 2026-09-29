"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type Dot = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
}

type Shock = { x: number; y: number; born: number }

const GAP = 22
const GAP_TOUCH = 28
const SIZE = 2
const RADIUS = 150
const PUSH = 2.4
const SPRING = 0.055
const DAMPING = 0.84
const SHOCK_SPEED = 0.9
const SHOCK_LIFE = 900
const SHOCK_BAND = 60
/** After this long without input the field only breathes, at a lower frame rate. */
const IDLE_AFTER_MS = 2000
const IDLE_FRAME_MS = 50

/** Reads a theme colour as something canvas understands. */
function readColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Page-wide interactive dot field (fixed behind content). Dots scatter away
 * from the pointer and spring home, glow yellow near it, breathe with a slow
 * idle wave, and a click sends a shockwave. Static under reduced motion;
 * paused while the tab is hidden.
 */
export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const gap = coarse ? GAP_TOUCH : GAP

    let dots: Dot[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let pointer = { x: -9999, y: -9999, active: false }
    let lastInput = 0
    let lastDraw = 0
    const shocks: Shock[] = []
    let colors = { bg: "", dot: "", hot: "" }

    const syncColors = () => {
      colors = {
        bg: readColor("--background"),
        dot: readColor("--muted-foreground"),
        hot: readColor("--primary"),
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots = []
      const cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1
      const offsetX = (width - (cols - 1) * gap) / 2
      const offsetY = (height - (rows - 1) * gap) / 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots.push({ x: offsetX + col * gap, y: offsetY + row * gap, ox: 0, oy: 0, vx: 0, vy: 0 })
        }
      }
      if (reducedMotion) draw(0)
    }

    const draw = (time: number) => {
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, width, height)

      const now = performance.now()
      for (let i = shocks.length - 1; i >= 0; i--) {
        if (now - shocks[i]!.born > SHOCK_LIFE) shocks.splice(i, 1)
      }

      const hot: Array<[number, number, number]> = []
      ctx.fillStyle = colors.dot

      for (const dot of dots) {
        let heat = 0

        if (!reducedMotion) {
          const px = dot.x + dot.ox
          const py = dot.y + dot.oy

          if (pointer.active) {
            const dx = px - pointer.x
            const dy = py - pointer.y
            const dist = Math.hypot(dx, dy)
            if (dist < RADIUS && dist > 0.01) {
              const force = (1 - dist / RADIUS) ** 2
              dot.vx += (dx / dist) * force * PUSH
              dot.vy += (dy / dist) * force * PUSH
              heat = Math.max(heat, force)
            }
          }

          for (const shock of shocks) {
            const age = now - shock.born
            const ring = age * SHOCK_SPEED
            const dx = dot.x - shock.x
            const dy = dot.y - shock.y
            const dist = Math.hypot(dx, dy)
            const band = Math.abs(dist - ring)
            if (band < SHOCK_BAND && dist > 0.01) {
              const fade = 1 - age / SHOCK_LIFE
              const force = (1 - band / SHOCK_BAND) * fade
              dot.vx += (dx / dist) * force * 1.6
              dot.vy += (dy / dist) * force * 1.6
              heat = Math.max(heat, force)
            }
          }

          dot.vx = (dot.vx - dot.ox * SPRING) * DAMPING
          dot.vy = (dot.vy - dot.oy * SPRING) * DAMPING
          dot.ox += dot.vx
          dot.oy += dot.vy
        }

        // Idle breathing — a slow diagonal wave in dot opacity.
        const wave = reducedMotion
          ? 0.5
          : 0.5 + 0.5 * Math.sin((dot.x + dot.y) * 0.012 - time * 0.0012)

        if (heat > 0.08) {
          hot.push([dot.x + dot.ox, dot.y + dot.oy, heat])
        } else {
          ctx.globalAlpha = 0.14 + wave * 0.16
          ctx.fillRect(dot.x + dot.ox - SIZE / 2, dot.y + dot.oy - SIZE / 2, SIZE, SIZE)
        }
      }

      ctx.fillStyle = colors.hot
      for (const [x, y, heat] of hot) {
        const size = SIZE + heat * 3.5
        ctx.globalAlpha = 0.35 + heat * 0.65
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
    }

    const loop = (time: number) => {
      frame = 0
      if (!visible || document.hidden) return
      const idle = time - lastInput > IDLE_AFTER_MS && shocks.length === 0
      if (!idle || time - lastDraw >= IDLE_FRAME_MS) {
        draw(time)
        lastDraw = time
      }
      frame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (!frame && !reducedMotion) frame = window.requestAnimationFrame(loop)
    }

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const onMove = (event: PointerEvent) => {
      const local = toLocal(event)
      pointer = { ...local, active: event.pointerType !== "touch" || event.buttons > 0 }
      lastInput = performance.now()
    }
    const onLeave = () => {
      pointer = { ...pointer, active: false }
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") onLeave()
    }
    const onDown = (event: PointerEvent) => {
      shocks.push({ ...toLocal(event), born: performance.now() })
      lastInput = performance.now()
      if (shocks.length > 4) shocks.shift()
    }

    syncColors()
    resize()
    start()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      if (visible) start()
    })
    visibility.observe(canvas)

    const themeObserver = new MutationObserver(() => {
      syncColors()
      if (reducedMotion) draw(0)
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    const onVisibility = () => {
      if (!document.hidden) start()
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerdown", onDown, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })
    window.addEventListener("pointercancel", onLeave, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      themeObserver.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onLeave)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("dot-field pointer-events-none fixed inset-0 z-0 size-full", className)}
    />
  )
}
