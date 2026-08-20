"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

export type ShippingPressLabels = {
  ticket: string
  building: string
  scanning: string
  shipped: string
  archive: string
}

type ProjectNotesDeskDecorProps = {
  projectId: string
  projectTitle: string
  hint: string
  labels: ShippingPressLabels
}

const IMPACT_PARTICLES = [
  { x: 222, y: 61, dx: -24, dy: -15, rotate: -28 },
  { x: 238, y: 43, dx: -13, dy: -22, rotate: -8 },
  { x: 276, y: 40, dx: 7, dy: -24, rotate: 12 },
  { x: 311, y: 49, dx: 20, dy: -18, rotate: 32 },
  { x: 321, y: 75, dx: 27, dy: -2, rotate: 76 },
  { x: 303, y: 98, dx: 18, dy: 16, rotate: 122 },
  { x: 235, y: 100, dx: -17, dy: 16, rotate: -118 },
] as const

function shortenTitle(title: string) {
  return title.length > 25 ? `${title.slice(0, 24)}…` : title
}

export function ProjectNotesDeskDecor({
  projectId,
  projectTitle,
  hint,
  labels,
}: ProjectNotesDeskDecorProps) {
  const scopeRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const scope = scopeRef.current
      if (!scope) return

      const media = gsap.matchMedia()

      media.add(
        {
          canMove: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (!conditions?.canMove) return

          const ticket = "[data-press='ticket']"
          const codeLines = "[data-press='code-line']"
          const scanner = "[data-press='scanner']"
          const progress = "[data-press='progress']"
          const stamp = "[data-press='stamp']"
          const mark = "[data-press='mark']"
          const particles = "[data-press='particle']"
          const building = "[data-press-status='building']"
          const scanning = "[data-press-status='scanning']"
          const shipped = "[data-press-status='shipped']"
          const archive = "[data-press='archive']"
          const archiveLight = "[data-press='archive-light']"
          const loopClock = "[data-press='loop-clock']"

          gsap.set(ticket, {
            autoAlpha: 0,
            x: -250,
            y: 0,
            scale: 1,
            transformOrigin: "center center",
          })
          gsap.set(codeLines, {
            scaleX: 0,
            transformOrigin: "left center",
          })
          gsap.set(scanner, { autoAlpha: 0, x: 0 })
          gsap.set(progress, {
            scaleX: 0,
            transformOrigin: "left center",
          })
          gsap.set(stamp, { y: -54 })
          gsap.set(mark, {
            autoAlpha: 0,
            scale: 0.55,
            rotation: -13,
            transformOrigin: "center center",
          })
          gsap.set(particles, { autoAlpha: 0, scale: 0 })
          gsap.set([building, scanning, shipped], { autoAlpha: 0 })
          gsap.set(shipped, { transformOrigin: "left center" })
          gsap.set(archiveLight, { scale: 1, transformOrigin: "center center" })

          const timeline = gsap.timeline({
            paused: true,
            repeat: -1,
            defaults: { ease: "power2.inOut" },
          })

          timeline
            .addLabel("enter", 0)
            .to(
              ticket,
              {
                autoAlpha: 1,
                x: 0,
                duration: 0.7,
                ease: "back.out(1.15)",
              },
              "enter",
            )
            .addLabel("build", 0.7)
            .set(building, { autoAlpha: 1 }, "build")
            .to(
              codeLines,
              {
                scaleX: 1,
                duration: 0.42,
                stagger: 0.14,
                ease: "power2.out",
              },
              "build",
            )
            .addLabel("scan", 1.5)
            .set(building, { autoAlpha: 0 }, "scan")
            .set(scanning, { autoAlpha: 1 }, "scan")
            .set(scanner, { autoAlpha: 1, x: 0 }, "scan")
            .to(
              scanner,
              { x: 180, duration: 0.8, ease: "sine.inOut" },
              "scan",
            )
            .to(
              progress,
              { scaleX: 1, duration: 0.8, ease: "sine.inOut" },
              "scan",
            )
            .set(scanner, { autoAlpha: 0 }, 2.3)
            .addLabel("stamp", 2.3)
            .to(stamp, { y: 0, duration: 0.42, ease: "power3.in" }, "stamp")
            .to(
              ticket,
              { scaleY: 0.92, duration: 0.12, ease: "power3.out" },
              "stamp+=0.4",
            )
            .addLabel("impact", 2.82)
            .set(scanning, { autoAlpha: 0 }, "impact")
            .set(shipped, { autoAlpha: 1 }, "impact")
            .to(
              mark,
              {
                autoAlpha: 1,
                scale: 1,
                rotation: -7,
                duration: 0.42,
                ease: "back.out(2)",
              },
              "impact",
            )
            .to(
              particles,
              {
                autoAlpha: 1,
                scale: 1,
                x: (_, target) => Number(target.getAttribute("data-dx")),
                y: (_, target) => Number(target.getAttribute("data-dy")),
                duration: 0.32,
                stagger: 0.025,
                ease: "power3.out",
              },
              "impact",
            )
            .to(ticket, { scaleY: 1, duration: 0.25, ease: "back.out(2)" }, "impact")
            .to(stamp, { y: -42, duration: 0.48, ease: "back.out(1.4)" }, "impact+=0.1")
            .to(particles, { autoAlpha: 0, duration: 0.35 }, "impact+=0.35")
            .addLabel("archive", 4.5)
            .to(
              ticket,
              {
                x: 315,
                y: 13,
                scale: 0.38,
                duration: 1,
                ease: "power2.inOut",
              },
              "archive",
            )
            .to(
              archive,
              { y: -5, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 },
              "archive+=0.72",
            )
            .addLabel("complete", 5.5)
            .to(
              archiveLight,
              {
                scale: 1.8,
                autoAlpha: 0.35,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "sine.inOut",
              },
              "complete",
            )
            .to(shipped, { scale: 1.08, duration: 0.28, yoyo: true, repeat: 1 }, "complete")
            .addLabel("reset", 6.2)
            .to(
              [ticket, shipped],
              { autoAlpha: 0, duration: 0.45, ease: "power2.in" },
              "reset",
            )
            .to(loopClock, { autoAlpha: 0, duration: 0.8 }, "reset")

          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry?.isIntersecting && entry.intersectionRatio >= 0.2) {
                timeline.play()
              } else {
                timeline.pause()
              }
            },
            { threshold: [0, 0.2] },
          )

          observer.observe(scope)

          return () => {
            observer.disconnect()
            timeline.kill()
          }
        },
      )

      return () => media.revert()
    },
    { scope: scopeRef },
  )

  const title = shortenTitle(projectTitle)

  return (
    <aside
      ref={scopeRef}
      data-project-id={projectId}
      aria-label={`${labels.ticket}: ${projectTitle} — ${labels.shipped}`}
      className="pointer-events-none relative hidden min-h-14 overflow-hidden border border-border bg-muted/20 md:block"
    >
      <svg
        viewBox="0 0 560 145"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[calc(100%_-_1.25rem)] w-full"
      >
        <defs>
          <pattern id={`press-grid-${projectId}`} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="var(--border)" opacity="0.65" />
          </pattern>
        </defs>

        <rect width="560" height="145" fill={`url(#press-grid-${projectId})`} opacity="0.45" />

        <g fill="none" stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke">
          <path d="M18 119H542" />
          <path d="M29 126H531" strokeDasharray="5 6" opacity="0.65" />
          <path d="M48 115v8M90 115v8M132 115v8M174 115v8M216 115v8M258 115v8M300 115v8M342 115v8M384 115v8M426 115v8M468 115v8M510 115v8" />
          <rect x="16" y="42" width="82" height="66" />
          <path d="M27 54h59M27 62h38M27 95h59" />
        </g>

        <text x="27" y="82" fill="var(--muted-foreground)" fontSize="8" letterSpacing="1.4">
          INPUT / 01
        </text>

        <g data-press="archive" fill="var(--card)" stroke="var(--border)" strokeWidth="1">
          <rect x="448" y="49" width="78" height="62" transform="rotate(4 487 80)" opacity="0.5" />
          <rect x="443" y="46" width="78" height="62" transform="rotate(-3 482 77)" opacity="0.72" />
          <rect x="438" y="43" width="78" height="62" />
          <path d="M449 55h56M449 64h42M449 73h50" fill="none" />
          <circle data-press="archive-light" cx="501" cy="92" r="4" fill="var(--primary)" stroke="none" />
        </g>
        <text x="441" y="125" fill="var(--muted-foreground)" fontSize="8" letterSpacing="1.25">
          {labels.archive.toUpperCase()} / 06
        </text>

        <g data-press="ticket">
          <rect x="126" y="35" width="214" height="76" fill="var(--card)" stroke="var(--foreground)" strokeWidth="1" />
          <rect x="126" y="35" width="7" height="76" fill="var(--primary)" />
          <text x="145" y="52" fill="var(--muted-foreground)" fontSize="7" letterSpacing="1.2">
            {labels.ticket.toUpperCase()} / {projectId.slice(0, 8).toUpperCase()}
          </text>
          <text x="145" y="70" fill="var(--foreground)" fontSize="12" fontWeight="700">
            {title}
          </text>
          <g data-press="code-line">
            <rect x="145" y="80" width="70" height="3" fill="var(--muted-foreground)" opacity="0.75" />
          </g>
          <g data-press="code-line">
            <rect x="145" y="88" width="112" height="3" fill="var(--muted-foreground)" opacity="0.52" />
          </g>
          <g data-press="code-line">
            <rect x="145" y="96" width="91" height="3" fill="var(--muted-foreground)" opacity="0.34" />
          </g>
          <rect data-press="progress" x="133" y="107" width="207" height="4" fill="var(--primary)" />

          <g data-press="mark" transform="rotate(-7 287 84)">
            <rect x="257" y="66" width="66" height="28" fill="var(--primary)" stroke="var(--foreground)" strokeWidth="1" />
            <text
              x="290"
              y="81"
              fill="var(--primary-foreground)"
              fontSize="9"
              fontWeight="800"
              letterSpacing="1.3"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {labels.shipped.toUpperCase()}
            </text>
          </g>
        </g>

        <g data-press="scanner">
          <rect x="128" y="32" width="6" height="82" fill="var(--primary)" opacity="0.22" />
          <path d="M131 32v82" stroke="var(--primary)" strokeWidth="1.5" />
        </g>

        <g data-press="stamp">
          <path d="M270 5v27" stroke="var(--foreground)" strokeWidth="3" />
          <rect x="256" y="2" width="28" height="12" fill="var(--muted)" stroke="var(--border)" />
          <path d="M246 31h48l7 12h-62z" fill="var(--muted)" stroke="var(--foreground)" />
          <rect x="237" y="43" width="66" height="7" fill="var(--primary)" stroke="var(--foreground)" />
        </g>

        {IMPACT_PARTICLES.map((particle, index) => (
          <rect
            key={index}
            data-press="particle"
            data-dx={particle.dx}
            data-dy={particle.dy}
            x={particle.x}
            y={particle.y}
            width="3"
            height="10"
            rx="1.5"
            fill="var(--primary)"
            transform={`rotate(${particle.rotate} ${particle.x + 1.5} ${particle.y + 5})`}
          />
        ))}

        <g fontSize="8" fontWeight="700" letterSpacing="1.2">
          <text data-press-status="building" x="350" y="22" fill="var(--foreground)" opacity="0">
            01 — {labels.building.toUpperCase()}
          </text>
          <text data-press-status="scanning" x="350" y="22" fill="var(--primary)" opacity="0">
            02 — {labels.scanning.toUpperCase()}
          </text>
          <text data-press-status="shipped" x="350" y="22" fill="var(--primary)">
            03 — {labels.shipped.toUpperCase()}
          </text>
        </g>

        <rect data-press="loop-clock" x="0" y="0" width="1" height="1" fill="transparent" />
      </svg>

      <p className="absolute inset-x-2 bottom-1 truncate text-center font-mono text-[9px] uppercase tracking-[0.13em] text-muted-foreground">
        {hint}
      </p>
    </aside>
  )
}
