import { Suspense } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import {
  GithubProof,
  GithubProofSkeleton,
} from "@/components/molecules/github-proof"
import { HeroReveal } from "@/components/molecules/hero-reveal"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { resumeLinks } from "@/data/resume"

export async function HeroSection() {
  const t = await getTranslations("hero")
  const currentFocus = t.raw("currently.exploringItems") as string[]

  return (
    <section
      id="about"
      className="page-section box-border scroll-mt-0 content-start border-b border-border"
    >
      <HeroReveal className="col-span-10 grid grid-cols-10 gap-x-[var(--page-col-gap)]">
        <div className="col-span-10 grid min-h-[calc(100svh-8rem)] content-center gap-y-10 py-20 sm:min-h-[calc(100svh-10rem)] sm:py-24 lg:col-span-6 lg:min-h-[calc(100svh-12rem)] lg:py-16 lg:pr-4 xl:col-span-7 xl:pr-10">
          <div className="grid gap-5 sm:gap-6">
            <div
              data-hero-reveal
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <p className="system-label text-foreground">
                01 / {t("identityLabel")}
              </p>
              <span className="h-px w-10 bg-border" aria-hidden />
              <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                {t("name")}
              </p>
            </div>

            <h1 data-hero-reveal className="hero-headline max-w-[13ch]">
              {t("headline")}
            </h1>

            <div
              data-hero-reveal
              className="grid gap-2 border-l-2 border-primary pl-4 sm:pl-5"
            >
              <p className="text-base font-semibold text-foreground sm:text-lg">
                {t("specialization")}
              </p>
              <p className="font-mono text-xs leading-relaxed tracking-wide text-muted-foreground sm:text-sm">
                {t("technologies")}
              </p>
            </div>
          </div>

          <div data-hero-reveal className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              className="group min-h-11 rounded-none px-5"
              nativeButton={false}
              render={<a href="#projects" />}
            >
              {t("cta")}
              <ArrowDownRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                aria-hidden
              />
            </Button>
            <Button
              variant="outline"
              className="group min-h-11 rounded-none px-5"
              nativeButton={false}
              render={<TransitionLink href={resumeLinks.pagePath} />}
            >
              {t("ctaResume")}
              <ArrowUpRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Button>
          </div>

          <div
            data-hero-reveal
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.08em] uppercase sm:text-xs"
          >
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2 bg-primary" aria-hidden />
              {t("availability")}
            </span>
            <span className="text-muted-foreground">{t("location")}</span>
          </div>
        </div>

        <div
          data-hero-reveal
          className="col-span-10 pb-14 lg:col-span-4 lg:self-center lg:py-16 xl:col-span-3"
        >
          <Suspense fallback={<GithubProofSkeleton label={t("github.loading")} />}>
            <GithubProof />
          </Suspense>
        </div>

        <section
          aria-labelledby="currently-title"
          className="col-span-10 grid grid-cols-10 gap-x-[var(--page-col-gap)] gap-y-6 border-t border-border py-8 sm:py-10"
        >
          <header data-hero-reveal className="col-span-10 lg:col-span-2">
            <p id="currently-title" className="system-label text-foreground">
              02 / {t("currently.label")}
            </p>
            <p className="mt-2 max-w-36 text-xs leading-relaxed text-muted-foreground">
              {t("currently.note")}
            </p>
          </header>

          <div className="col-span-10 grid gap-6 sm:grid-cols-3 lg:col-span-8 lg:gap-0">
            <div data-hero-reveal className="currently-column sm:pr-5">
              <p className="system-label">
                01 / {t("currently.buildingLabel")}
              </p>
              <p className="currently-value">
                {t("currently.buildingValue")}
              </p>
            </div>
            <div
              data-hero-reveal
              className="currently-column sm:border-l sm:border-border sm:px-5"
            >
              <p className="system-label">
                02 / {t("currently.exploringLabel")}
              </p>
              <ul className="grid gap-1.5">
                {currentFocus.map((item) => (
                  <li key={item} className="currently-value">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              data-hero-reveal
              className="currently-column sm:border-l sm:border-border sm:pl-5"
            >
              <p className="system-label">
                03 / {t("currently.basedLabel")}
              </p>
              <p className="currently-value">{t("currently.basedValue")}</p>
            </div>
          </div>
        </section>
      </HeroReveal>
    </section>
  )
}
