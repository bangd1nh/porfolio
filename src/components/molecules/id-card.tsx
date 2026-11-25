"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Image from "next/image"
import { useRef } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useMotionTier } from "@/hooks/use-motion-tier"

gsap.registerPlugin(useGSAP)

type IdCardFact = {
  label: string
  value: string
  wide?: boolean
}

type IdCardProps = {
  label: string
  name: string
  initials: string
  /** Portrait under /public; falls back to the initials block when absent. */
  photo?: string
  role: string
  status: string
  serial: string
  facts: readonly IdCardFact[]
}

/**
 * Developer ID badge hanging from a lanyard. The badge sways on its own and
 * tilts in 3D toward the pointer.
 */
export function IdCard({
  label,
  name,
  initials,
  photo,
  role,
  status,
  serial,
  facts,
}: IdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const finePointer = useMediaQuery("(pointer: fine)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const lite = useMotionTier() === "lite"

  useGSAP(
    () => {
      const card = cardRef.current
      // 3D tilt + live glare repaint is too heavy for software compositing.
      if (!card || !finePointer || reducedMotion || lite) return

      const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" })
      const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" })
      gsap.set(card, { transformPerspective: 900 })

      const move = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        rotateY(x * 14)
        rotateX(-y * 10)
        card.style.setProperty("--glare-x", `${(x + 0.5) * 100}%`)
        card.style.setProperty("--glare-y", `${(y + 0.5) * 100}%`)
      }
      const leave = () => {
        rotateX(0)
        rotateY(0)
      }

      card.addEventListener("pointermove", move)
      card.addEventListener("pointerleave", leave)
      return () => {
        card.removeEventListener("pointermove", move)
        card.removeEventListener("pointerleave", leave)
      }
    },
    { dependencies: [finePointer, reducedMotion, lite], revertOnUpdate: true }
  )

  return (
    <div className="id-card-rig">
      <span className="id-card-lanyard" aria-hidden />
      <div className="id-card-swing">
        <span className="id-card-clip" aria-hidden />
        <div ref={cardRef} className="id-card">
          <header className="flex items-center justify-between gap-3 bg-primary px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.16em] text-primary-foreground uppercase">
            <span>{label}</span>
            <span className="id-card-slot" aria-hidden />
            <span>{serial}</span>
          </header>

          <div className="grid gap-5 p-5 short:gap-4 short:p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="id-card-photo">
                {photo ? (
                  <Image
                    src={photo}
                    alt={name}
                    fill
                    sizes="8rem"
                    className="object-cover"
                  />
                ) : (
                  <span aria-hidden>{initials}</span>
                )}
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="font-heading text-2xl leading-tight font-bold tracking-tight xl:text-[1.75rem] short:text-xl">
                  {name}
                </p>
                <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  {role}
                </p>
                <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.12em] text-foreground uppercase">
                  <span className="pulse-dot size-1.5 bg-primary" aria-hidden />
                  {status}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 border-2 border-border-brutal">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className={
                    fact.wide
                      ? "col-span-2 grid gap-1 border-t-2 border-border-brutal px-3 py-2.5 first:border-t-0"
                      : "grid gap-1 px-3 py-2.5 odd:border-r-2 odd:border-border-brutal"
                  }
                >
                  <dt className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
                    {fact.label}
                  </dt>
                  <dd className="text-sm font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <footer className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <span className="id-card-barcode" aria-hidden />
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
                {serial}
              </span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
