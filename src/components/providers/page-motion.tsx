"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLocale } from "next-intl"
import { useEffect } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { useMotionTier } from "@/hooks/use-motion-tier"

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TOGGLE = "play none none reverse"

/**
 * Declarative scroll motion for the homepage. Markup opts in with attributes:
 * - data-reveal="title"  → masked words rise (render with <SplitWords>)
 * - data-reveal="up"     → fade + rise
 * - data-reveal="words"  → words brighten in sequence; nested data-reveal="marker" sweeps
 * - data-count="4"       → number counts up (keeps zero padding)
 * - data-reveal="draw"   → horizontal rule draws from the left
 * - data-reveal-group    → direct children stagger (data-reveal-group="clip" wipes)
 * - data-parallax="0.2"  → decorative drift while its section scrolls
 * - data-screen          → section softly recedes as the next screen arrives (lg+)
 * - data-spotlight       → pointer position exposed as --mx / --my
 * - data-magnetic        → element leans toward the pointer
 *
 * Every <section> also gets data-offscreen while out of view, which pauses its
 * infinite CSS loops (see globals.css).
 *
 * On the "lite" motion tier (software rendering) reveals animate whole blocks
 * instead of per-word/clip-path layers, and scroll scrubbing, parallax,
 * spotlight and magnetic effects are skipped.
 */
export function PageMotion() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Locale swaps re-render copy in place; rebuild triggers for the new nodes.
  const locale = useLocale()
  const lite = useMotionTier() === "lite"

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section")
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = entry.target as HTMLElement
          if (entry.isIntersecting) delete section.dataset.offscreen
          else section.dataset.offscreen = "true"
        }
      },
      { rootMargin: "10% 0px" }
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      sections.forEach((section) => delete section.dataset.offscreen)
    }
  }, [locale])

  useGSAP(
    () => {
      if (reducedMotion) return

      gsap.utils.toArray<HTMLElement>("[data-reveal='title']").forEach((el) => {
        if (lite) {
          gsap.from(el, {
            y: 24,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: TOGGLE },
          })
          return
        }
        gsap.from(el.querySelectorAll("[data-word]"), {
          yPercent: 115,
          rotate: 4,
          duration: 1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: TOGGLE },
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-reveal='words']").forEach((el) => {
        const trigger = { trigger: el, start: "top 85%", toggleActions: TOGGLE }
        if (lite) {
          gsap.from(el, { autoAlpha: 0, duration: 0.5, ease: "power2.out", scrollTrigger: trigger })
          return
        }
        gsap.from(el.querySelectorAll("[data-word]"), {
          opacity: 0.12,
          y: 10,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.035,
          scrollTrigger: trigger,
        })
        el.querySelectorAll<HTMLElement>("[data-reveal='marker']").forEach((marker) => {
          gsap.from(marker, {
            backgroundSize: "0% 100%",
            duration: 0.9,
            ease: "expo.inOut",
            delay: 0.6,
            scrollTrigger: trigger,
          })
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count)
        if (!Number.isFinite(target) || target <= 0) return
        const digits = el.textContent?.trim().length ?? 2
        const counter = { value: 0 }
        gsap.to(counter, {
          value: target,
          duration: 1.2,
          ease: "power2.out",
          snap: { value: 1 },
          onUpdate: () => {
            el.textContent = String(counter.value).padStart(digits, "0")
          },
          scrollTrigger: { trigger: el, start: "top 92%", toggleActions: TOGGLE },
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-reveal='up']").forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: Number(el.dataset.revealDelay ?? 0),
          scrollTrigger: { trigger: el, start: "top 92%", toggleActions: TOGGLE },
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-reveal='draw']").forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.1,
          ease: "expo.inOut",
          scrollTrigger: { trigger: el, start: "top 95%", toggleActions: TOGGLE },
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[]
        if (items.length === 0) return
        const wipe = !lite && group.dataset.revealGroup === "clip"

        gsap.fromTo(
          items,
          wipe
            ? { clipPath: "inset(0% 0% 100% 0%)", y: 36, autoAlpha: 0 }
            : { y: 32, autoAlpha: 0 },
          {
            ...(wipe ? { clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" } : {}),
            y: 0,
            autoAlpha: 1,
            duration: wipe ? 1 : 0.7,
            ease: wipe ? "expo.out" : "power3.out",
            stagger: Number(group.dataset.revealStagger ?? 0.08),
            scrollTrigger: { trigger: group, start: "top 90%", toggleActions: TOGGLE },
          }
        )
      })

      // Scrubbed effects repaint on every scroll frame — skip them in lite.
      if (lite) {
        document.fonts?.ready.then(() => ScrollTrigger.refresh())
        return
      }

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const depth = Number(el.dataset.parallax) || 0.2
        const section = el.closest("section") ?? el
        gsap.fromTo(
          el,
          { yPercent: -depth * 100 },
          {
            yPercent: depth * 100,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        )
      })

      const mm = gsap.matchMedia()
      mm.add("(min-width: 1024px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-screen]").forEach((section) => {
          if (!section.nextElementSibling) return
          // Animate children, not the section — it is the scroll-snap area.
          gsap.to(section.children, {
            y: () => -window.innerHeight * 0.1,
            autoAlpha: 0.15,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
        })
      })

      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { dependencies: [reducedMotion, locale, lite], revertOnUpdate: true }
  )

  useGSAP(
    () => {
      const finePointer = window.matchMedia("(pointer: fine)").matches
      if (reducedMotion || !finePointer || lite) return

      let spotlight: HTMLElement | null = null
      let pending: PointerEvent | null = null
      let frame = 0
      // Layout reads + style writes at most once per frame, not per event.
      const flush = () => {
        frame = 0
        const event = pending
        pending = null
        if (!event) return
        const target = (event.target as Element | null)?.closest<HTMLElement>(
          "[data-spotlight]"
        )
        if (spotlight && spotlight !== target) spotlight.dataset.spotlightActive = ""
        spotlight = target ?? null
        if (!spotlight) return
        const rect = spotlight.getBoundingClientRect()
        spotlight.style.setProperty("--mx", `${event.clientX - rect.left}px`)
        spotlight.style.setProperty("--my", `${event.clientY - rect.top}px`)
        spotlight.dataset.spotlightActive = "true"
      }
      const onMove = (event: PointerEvent) => {
        pending = event
        if (!frame) frame = window.requestAnimationFrame(flush)
      }
      window.addEventListener("pointermove", onMove, { passive: true })

      const cleanups = gsap.utils
        .toArray<HTMLElement>("[data-magnetic]")
        .map((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" })
          const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" })
          const strength = Number(el.dataset.magnetic) || 0.3
          const move = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            xTo((event.clientX - rect.left - rect.width / 2) * strength)
            yTo((event.clientY - rect.top - rect.height / 2) * strength)
          }
          const leave = () => {
            xTo(0)
            yTo(0)
          }
          el.addEventListener("pointermove", move)
          el.addEventListener("pointerleave", leave)
          return () => {
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerleave", leave)
          }
        })

      return () => {
        window.removeEventListener("pointermove", onMove)
        if (frame) window.cancelAnimationFrame(frame)
        cleanups.forEach((cleanup) => cleanup())
      }
    },
    { dependencies: [reducedMotion, locale, lite], revertOnUpdate: true }
  )

  return null
}
