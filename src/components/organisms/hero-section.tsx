import { Suspense } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import {
  CurrentGithubPreview,
  CurrentGithubPreviewSkeleton,
  GithubProof,
  GithubProofSkeleton,
} from "@/components/molecules/github-proof"
import { HeroReveal } from "@/components/molecules/hero-reveal"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { resumeLinks } from "@/data/resume"
import { VIEWPORT_SECTION } from "@/data/site"

export async function HeroSection() {
  const t = await getTranslations("hero")
  const currentFocus = t.raw("currently.exploringItems") as string[]

  return (
    <section
      id="about"
      className={`page-section box-border scroll-mt-0 border-b border-border lg:grid-rows-[minmax(0,1fr)] ${VIEWPORT_SECTION}`}
    >
      <HeroReveal className="col-span-10 grid h-full min-h-0 grid-cols-10 grid-rows-[minmax(0,1fr)_auto] gap-x-[var(--page-col-gap)] gap-y-3 px-0 pt-6 pb-4 sm:gap-y-4 sm:pt-8 sm:pb-5 lg:gap-y-4 lg:pt-[calc(var(--site-dock-height)+var(--site-dock-offset)+0.5rem)] lg:pb-5">
        <div className="col-span-10 grid min-h-0 grid-cols-10 content-center gap-x-[var(--page-col-gap)] gap-y-6">
          <div className="col-span-10 grid content-center gap-y-8 lg:col-span-6 lg:pr-4 xl:col-span-7 xl:pr-10">
            <div className="grid gap-4 sm:gap-5">
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

              <p
                data-hero-reveal
                className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {t("positioning")}
              </p>

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
                  className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 motion-reduce:transition-none"
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
                  className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
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
            className="col-span-10 lg:col-span-4 lg:self-center xl:col-span-3"
          >
            <Suspense fallback={<GithubProofSkeleton label={t("github.loading")} />}>
              <GithubProof />
            </Suspense>
          </div>
        </div>

        <section
          aria-labelledby="currently-title"
          className="col-span-10 grid grid-cols-10 gap-x-[var(--page-col-gap)] gap-y-4 border-t border-border pt-5 sm:gap-y-5 sm:pt-6"
        >
          <header data-hero-reveal className="col-span-10 lg:col-span-2">
            <p id="currently-title" className="system-label text-foreground">
              02 / {t("currently.label")}
            </p>
            <p className="mt-2 max-w-36 text-xs leading-relaxed text-muted-foreground">
              {t("currently.note")}
            </p>
          </header>

          <div className="col-span-10 grid overflow-hidden border border-border bg-card lg:col-span-8 lg:grid-cols-[minmax(18rem,1.25fr)_minmax(0,2fr)]">
            <div
              data-hero-reveal
              className="relative grid content-center gap-3 border-b border-border p-4 sm:p-5 lg:border-r lg:border-b-0"
            >
              <span
                className="absolute inset-y-0 left-0 w-1 bg-primary"
                aria-hidden
              />
              <p className="system-label">
                01 / {t("currently.roleLabel")}
              </p>
              <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {t("currently.roleValue")}
              </p>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                {t("currently.mission")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              <div data-hero-reveal className="grid content-start gap-2 p-4 sm:p-5">
                <p className="system-label">
                  02 / {t("currently.stackLabel")}
                </p>
                <p className="currently-value">{t("currently.stackValue")}</p>
              </div>
              <div
                data-hero-reveal
                className="border-t border-border sm:border-t-0 sm:border-l"
              >
                <Suspense
                  fallback={
                    <CurrentGithubPreviewSkeleton
                      label={t("currently.githubLabel")}
                      value={t("currently.githubValue")}
                    />
                  }
                >
                  <CurrentGithubPreview />
                </Suspense>
              </div>
              <div
                data-hero-reveal
                className="grid content-start gap-2 border-t border-border p-4 sm:p-5 xl:border-t-0 xl:border-l"
              >
                <p className="system-label">
                  04 / {t("currently.aiLabel")}
                </p>
                <p className="currently-value">{currentFocus.join(" · ")}</p>
              </div>
              <div
                data-hero-reveal
                className="grid content-start gap-2 border-t border-border p-4 sm:border-l sm:p-5 xl:border-t-0"
              >
                <p className="system-label">
                  05 / {t("currently.basedLabel")}
                </p>
                <p className="currently-value">{t("currently.basedValue")}</p>
              </div>
            </div>
          </div>
        </section>
      </HeroReveal>
    </section>
  )
}
