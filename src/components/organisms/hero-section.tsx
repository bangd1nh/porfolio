import { FileDown } from "lucide-react"

import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { TypewriterText } from "@/components/atoms/typewriter-text"
import { CompositionCard } from "@/components/molecules/composition-card"
import { GithubActivity } from "@/components/molecules/github-activity"
import { Button } from "@/components/ui/button"
import { bentoContent } from "@/data/bento"
import { resumeLinks } from "@/data/resume"
import { Link } from "@/i18n/navigation"
import { getGithubStats, githubOrgFallback } from "@/lib/github-stats"
import { getLocale, getTranslations } from "next-intl/server"

export async function HeroSection() {
  const t = await getTranslations("hero")
  const locale = await getLocale()
  const name = t("name")
  const phrases = t.raw("typewriter") as string[]
  const githubStats = await getGithubStats()
  const organizations = githubStats?.organizations ?? [...githubOrgFallback]
  const weeks = githubStats?.weeks ?? []
  const contributions =
    githubStats?.contributions ?? bentoContent.github.contributions

  return (
    <section
      id="about"
      className="page-section box-border items-center gap-y-5 pt-8 pb-8 sm:gap-y-6 sm:pt-12 sm:pb-12 lg:box-border lg:h-svh lg:gap-y-6 lg:overflow-hidden lg:!pt-0 lg:pb-6"
    >
      <div className="col-span-10 grid content-center justify-items-center gap-3 text-center sm:gap-4 md:col-span-5 md:justify-items-start md:text-left">
        <span className="rounded-none border border-border bg-card px-3 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase sm:px-4 sm:text-xs">
          {t("role")}
        </span>
        <h1 className="font-heading text-3xl tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          {name}
        </h1>
        <TypewriterText
          phrases={phrases}
          className="max-w-xl justify-self-center md:justify-self-start"
        />

        <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2 sm:max-w-none md:justify-start">
          <Button
            className="min-h-10 cursor-pointer rounded-none"
            nativeButton={false}
            render={<a href="#projects" />}
          >
            {t("cta")}
          </Button>
          <Button
            variant="outline"
            className="min-h-10 cursor-pointer rounded-none"
            nativeButton={false}
            render={<a href="#contact" />}
          >
            {t("ctaContact")}
          </Button>
          <Button
            variant="outline"
            className="min-h-10 cursor-pointer rounded-none"
            nativeButton={false}
            render={<Link href={resumeLinks.pagePath} />}
          >
            <FileDown className="size-4" aria-hidden />
            {t("ctaResume")}
          </Button>
        </div>

        <ScrollReveal className="mt-1 w-fit max-w-full justify-self-center md:justify-self-start">
          <GithubActivity
            compact
            className="border-border/80 bg-card/80"
            contributions={contributions}
            weeks={weeks}
            organizations={organizations}
            contributionsLabel={t("github.contributions")}
            organizationsLabel={t("github.organizations")}
            lessLabel={t("github.less")}
            moreLabel={t("github.more")}
            privateHint={
              githubStats?.privateHidden ? t("github.privateHint") : null
            }
            locale={locale}
          />
        </ScrollReveal>
      </div>

      <CompositionCard
        className="col-span-10 max-h-[42vh] max-w-[16rem] justify-self-center sm:max-w-xs md:col-span-5 md:max-h-[min(80svh,40rem)] md:max-w-[min(100%,40rem)] md:justify-self-center lg:max-h-[min(82svh,40rem)]"
        githubStats={githubStats}
      />
    </section>
  )
}
