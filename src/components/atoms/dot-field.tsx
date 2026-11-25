"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { isLiteMotion } from "@/lib/motion-tier"

type Dot = {
  x: number
  y: number
  ox: number
  oy: number
  vx: number
  vy: number
  heat: number
}

type Shock = { x: number; y: number; born: number }

type Box = { x0: number; y0: number; x1: number; y1: number }

type FieldConfig = {
  gap: number
  gapTouch: number
  maxDpr: number
  /** Idle breathing wave — needs a full-canvas repaint every frame. */
  wave: boolean
  shockLife: number
}

/** GPU-composited machines: full repaint, breathing wave, retina canvas. */
const FULL: FieldConfig = { gap: 22, gapTouch: 28, maxDpr: 2, wave: true, shockLife: 900 }
/**
 * Software rendering: 1x canvas, no wave, and only the region around moving
 * dots is repainted. With no input the loop stops entirely.
 */
const LITE: FieldConfig = { gap: 26, gapTouch: 32, maxDpr: 1, wave: false, shockLife: 650 }

const SIZE = 2
const HOT_GROWTH = 3.5
const RADIUS = 150
const PUSH = 2.4
const SPRING = 0.055
const DAMPING = 0.84
const SHOCK_SPEED = 0.9
const SHOCK_BAND = 60
/** Below this, a dot counts as at rest and snaps home. */
const REST = 0.05
/** Padding around a dirty box: half the largest hot dot plus anti-alias slack. */
const DIRTY_PAD = (SIZE + HOT_GROWTH) / 2 + 2
/**
 * Lite tier: with the pointer resting, edge dots can flicker in and out of
 * its radius forever. Freeze the frame this long after the last input.
 */
const SETTLE_MS = 600
/** After this long without input the field only breathes, at a lower frame rate. */
const IDLE_AFTER_MS = 2000
const IDLE_FRAME_MS = 50

/** Reads a theme colour as something canvas understands. */
function readColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function growBox(box: Box | null, x: number, y: number): Box {
  if (!box) return { x0: x, y0: y, x1: x, y1: y }
  if (x < box.x0) box.x0 = x
  if (x > box.x1) box.x1 = x
  if (y < box.y0) box.y0 = y
  if (y > box.y1) box.y1 = y
  return box
}

function unionBox(a: Box | null, b: Box | null): Box | null {
  if (!a) return b && { ...b }
  if (!b) return { ...a }
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  }
}

/**
 * Page-wide interactive dot field (fixed behind content). Dots scatter away
 * from the pointer and spring home, glow yellow near it, breathe with a slow
 * idle wave, and a click sends a shockwave. Static under reduced motion;
 * paused while the tab is hidden. On the "lite" motion tier it keeps the
 * interaction but repaints only the dirty region and sleeps when settled.
 */
export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d", { alpha: false })
    if (!canvas || !ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const coarse = window.matchMedia("(pointer: coarse)").matches
    const lite = isLiteMotion()
    const config = lite ? LITE : FULL
    const gap = coarse ? config.gapTouch : config.gap

    let dots: Dot[] = []
    let cols = 0
    let rows = 0
    let originX = 0
    let originY = 0
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let pointer = { x: -9999, y: -9999, active: false }
    let lastInput = 0
    let lastDraw = 0
    /** Region the previous frame painted moving dots into (lite only). */
    let previousBox: Box | null = null
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
      const deviceDpr = window.devicePixelRatio || 1
      const dpr = Math.min(deviceDpr, config.maxDpr)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // Square dots stay crisp when a capped canvas is upscaled.
      canvas.style.imageRendering = dpr < deviceDpr ? "pixelated" : ""
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dots = []
      cols = Math.ceil(width / gap) + 1
      rows = Math.ceil(height / gap) + 1
      originX = (width - (cols - 1) * gap) / 2
      originY = (height - (rows - 1) * gap) / 2
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots.push({
            x: originX + col * gap,
            y: originY + row * gap,
            ox: 0,
            oy: 0,
            vx: 0,
            vy: 0,
            heat: 0,
          })
        }
      }
      previousBox = null
      paint(performance.now(), null)
    }

    /**
     * Advances physics one step. Returns the box covering every displaced or
     * glowing dot (rest and drawn positions) and whether anything still moves.
     */
    const simulate = (now: number) => {
      for (let i = shocks.length - 1; i >= 0; i--) {
        if (now - shocks[i]!.born > config.shockLife) shocks.splice(i, 1)
      }

      let box: Box | null = null
      let moving = shocks.length > 0

      for (const dot of dots) {
        let heat = 0
        const px = dot.x + dot.ox
        const py = dot.y + dot.oy

        if (pointer.active) {
          const dx = px - pointer.x
          const dy = py - pointer.y
          // Cheap square reject before the hypot.
          if (dx < RADIUS && dx > -RADIUS && dy < RADIUS && dy > -RADIUS) {
            const dist = Math.hypot(dx, dy)
            if (dist < RADIUS && dist > 0.01) {
              const force = (1 - dist / RADIUS) ** 2
              dot.vx += (dx / dist) * force * PUSH
              dot.vy += (dy / dist) * force * PUSH
              heat = force
            }
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
            const fade = 1 - age / config.shockLife
            const force = (1 - band / SHOCK_BAND) * fade
            dot.vx += (dx / dist) * force * 1.6
            dot.vy += (dy / dist) * force * 1.6
            if (force > heat) heat = force
          }
        }

        const resting =
          heat === 0 &&
          Math.abs(dot.vx) < REST &&
          Math.abs(dot.vy) < REST &&
          Math.abs(dot.ox) < REST &&
          Math.abs(dot.oy) < REST

        if (resting) {
          dot.ox = dot.oy = dot.vx = dot.vy = 0
          dot.heat = 0
          continue
        }

        dot.vx = (dot.vx - dot.ox * SPRING) * DAMPING
        dot.vy = (dot.vy - dot.oy * SPRING) * DAMPING
        dot.ox += dot.vx
        dot.oy += dot.vy
        dot.heat = heat

        // Still travelling, or displaced with nothing holding it there (it
        // must spring home). A dot held still under a resting pointer is not.
        if (
          Math.abs(dot.vx) >= REST ||
          Math.abs(dot.vy) >= REST ||
          (heat === 0 && (Math.abs(dot.ox) >= REST || Math.abs(dot.oy) >= REST))
        ) {
          moving = true
        }
        box = growBox(box, dot.x, dot.y)
        box = growBox(box, dot.x + dot.ox, dot.y + dot.oy)
      }

      return { box, moving }
    }

    /** Paints the whole field, or only `region` (clipped) when given. */
    const paint = (time: number, region: Box | null) => {
      let c0 = 0
      let c1 = cols - 1
      let r0 = 0
      let r1 = rows - 1

      if (region) {
        const x0 = Math.max(0, Math.floor(region.x0 - DIRTY_PAD))
        const y0 = Math.max(0, Math.floor(region.y0 - DIRTY_PAD))
        const x1 = Math.min(width, Math.ceil(region.x1 + DIRTY_PAD))
        const y1 = Math.min(height, Math.ceil(region.y1 + DIRTY_PAD))
        if (x1 <= x0 || y1 <= y0) return
        ctx.save()
        ctx.beginPath()
        ctx.rect(x0, y0, x1 - x0, y1 - y0)
        ctx.clip()
        ctx.fillStyle = colors.bg
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
        // Every dot moving into this box has its rest position inside it, so
        // the grid range of the box (plus one cell) covers all of them.
        c0 = Math.max(0, Math.floor((x0 - originX) / gap) - 1)
        c1 = Math.min(cols - 1, Math.ceil((x1 - originX) / gap) + 1)
        r0 = Math.max(0, Math.floor((y0 - originY) / gap) - 1)
        r1 = Math.min(rows - 1, Math.ceil((y1 - originY) / gap) + 1)
      } else {
        ctx.fillStyle = colors.bg
        ctx.fillRect(0, 0, width, height)
      }

      const breathe = config.wave && !reducedMotion
      const hot: Dot[] = []
      ctx.fillStyle = colors.dot
      ctx.globalAlpha = 0.22

      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const dot = dots[row * cols + col]
          if (!dot) continue
          if (dot.heat > 0.08) {
            hot.push(dot)
            continue
          }
          if (breathe) {
            // Idle breathing — a slow diagonal wave in dot opacity.
            const wave = 0.5 + 0.5 * Math.sin((dot.x + dot.y) * 0.012 - time * 0.0012)
            ctx.globalAlpha = 0.14 + wave * 0.16
          }
          ctx.fillRect(dot.x + dot.ox - SIZE / 2, dot.y + dot.oy - SIZE / 2, SIZE, SIZE)
        }
      }

      ctx.fillStyle = colors.hot
      for (const dot of hot) {
        const size = SIZE + dot.heat * HOT_GROWTH
        ctx.globalAlpha = 0.35 + dot.heat * 0.65
        ctx.fillRect(dot.x + dot.ox - size / 2, dot.y + dot.oy - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      if (region) ctx.restore()
    }

    const loopFull = (time: number) => {
      const idle = time - lastInput > IDLE_AFTER_MS && shocks.length === 0
      if (!idle || time - lastDraw >= IDLE_FRAME_MS) {
        simulate(performance.now())
        paint(time, null)
        lastDraw = time
      }
      frame = window.requestAnimationFrame(loop)
    }

    const loopLite = (time: number) => {
      const { box, moving } = simulate(performance.now())
      // Repaint where moving dots were last frame and where they are now.
      const dirty = unionBox(previousBox, box)
      if (dirty) paint(time, dirty)
      previousBox = box
      // Sleep until the next input once settled. A resting pointer freezes the
      // frame after SETTLE_MS; without a pointer, dots always reach home.
      const held = pointer.active && time - lastInput > SETTLE_MS && shocks.length === 0
      if (moving && !held) frame = window.requestAnimationFrame(loop)
    }

    const loop = (time: number) => {
      frame = 0
      if (!visible || document.hidden) return
      if (lite) loopLite(time)
      else loopFull(time)
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
      start()
    }
    const onLeave = () => {
      pointer = { ...pointer, active: false }
      start()
    }
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") onLeave()
    }
    const onDown = (event: PointerEvent) => {
      shocks.push({ ...toLocal(event), born: performance.now() })
      lastInput = performance.now()
      if (shocks.length > 4) shocks.shift()
      start()
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
      paint(performance.now(), null)
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    const onVisibility = () => {
      if (!document.hidden) start()
    }

    if (!reducedMotion) {
      window.addEventListener("pointermove", onMove, { passive: true })
      window.addEventListener("pointerdown", onDown, { passive: true })
      window.addEventListener("pointerup", onUp, { passive: true })
      window.addEventListener("pointercancel", onLeave, { passive: true })
      document.documentElement.addEventListener("pointerleave", onLeave)
      document.addEventListener("visibilitychange", onVisibility)
    }

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
