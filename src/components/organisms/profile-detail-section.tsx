import { Fragment } from "react"
import { getLocale, getTranslations } from "next-intl/server"

import { SplitWords } from "@/components/atoms/split-words"
import { IdCard } from "@/components/molecules/id-card"
import { JourneyTabs, type JourneyEntry } from "@/components/molecules/journey-tabs"
import {
  SectionHeading,
  SectionWatermark,
} from "@/components/molecules/section-heading"
import { experienceContent } from "@/data/experience"
import { profileContent } from "@/data/profile"
import { projectsContent } from "@/data/projects"
import { VIEWPORT_SECTION } from "@/data/site"

type LocaleKey = "en" | "vi"

const SHIPPING_SINCE = "2024"

const pad = (value: number) => String(value).padStart(2, "0")

/** Initials from the last two name parts — "Nguyễn Đình Bảng" → "ĐB". */
function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
}

/**
 * About screen — hanging developer ID, a statement that reads in word by
 * word, headline numbers, and a tabbed career rail.
 */
export async function ProfileDetailSection() {
  const t = await getTranslations("profile")
  const tHero = await getTranslations("hero")
  const tExperience = await getTranslations("experience")
  const locale = (await getLocale()) as LocaleKey
  const { name, birth, location, role, education } = profileContent

  const statement = tHero("description")
  const accent = t("statementAccent")
  const accentAt = statement.indexOf(accent)

  const work: JourneyEntry[] = experienceContent.map((item) => ({
    id: item.id,
    kind: "work",
    title: tExperience(`items.${item.id}.company`),
    subtitle: tExperience(`items.${item.id}.role`),
    period: item.period,
    current: item.period.toLowerCase().includes("present"),
    summary: tExperience(`items.${item.id}.summary`),
    bullets: item.bulletKeys.map((key) =>
      tExperience(
        `items.${item.id}.bullets.${key}` as Parameters<typeof tExperience>[0]
      )
    ),
    ...(item.githubUrl
      ? { linkHref: item.githubUrl, linkLabel: tExperience("repo") }
      : {}),
  }))

  const journey: JourneyEntry[] = [
    {
      id: "education",
      kind: "education",
      title: t("fields.education"),
      subtitle: education[locale],
      period: "2021 – 2025",
    },
    ...[...work].reverse(),
  ]

  const stats = [
    { value: pad(projectsContent.length), label: t("stats.projects"), count: projectsContent.length },
    { value: pad(experienceContent.length), label: t("stats.workplaces"), count: experienceContent.length },
    { value: SHIPPING_SINCE, label: t("stats.since") },
  ]

  return (
    <section
      id="profile"
      data-screen
      className={`page-section box-border content-start gap-y-6 pt-10 pb-12 sm:pt-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-6 lg:py-8 short:gap-y-4 short:py-6 ${VIEWPORT_SECTION}`}
    >
      <SectionWatermark index={2} />
      <SectionHeading
        index={2}
        label={t("badge")}
        title={t("title")}
        description={t("description")}
        titleClassName="short:text-4xl"
      />

      <div className="col-span-10 grid min-h-0 grid-cols-10 gap-x-[var(--page-col-gap)] gap-y-10 lg:gap-y-0">
        <div data-reveal-group className="col-span-10 grid min-h-0 lg:col-span-4 xl:col-span-4">
          <IdCard
            label={t("card.label")}
            name={name[locale]}
            initials={initialsOf(name[locale])}
            photo="/profile/bang.jpg"
            role={role[locale]}
            status={t("card.status")}
            serial={`DEV-${birth.replace("/", "")}`}
            facts={[
              { label: t("fields.birth"), value: birth },
              { label: t("fields.location"), value: location[locale] },
              { label: t("fields.education"), value: education[locale], wide: true },
            ]}
          />
        </div>

        <div className="col-span-10 grid min-h-0 content-start gap-6 lg:col-span-6 lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:pl-4 xl:pl-8 short:gap-4">
          <p
            data-reveal="words"
            className="font-heading text-2xl leading-[1.25] font-semibold tracking-tight text-balance sm:text-3xl xl:text-[2.4rem] short:text-2xl"
          >
            {accentAt < 0 ? (
              <SplitWords text={statement} />
            ) : (
              <Fragment>
                <SplitWords text={statement.slice(0, accentAt)} />{" "}
                <span data-reveal="marker" className="statement-marker">
                  <SplitWords text={accent} />
                </span>
                <SplitWords text={statement.slice(accentAt + accent.length)} />
              </Fragment>
            )}
          </p>

          <dl
            data-reveal-group
            className="grid grid-cols-3 border-y-2 border-border-brutal"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`grid gap-1 py-4 short:py-3 ${index > 0 ? "border-l-2 border-border-brutal pl-4 sm:pl-6" : "pr-4"}`}
              >
                <dt className="order-2 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd
                  data-count={stat.count}
                  className="order-1 font-heading text-4xl leading-none font-bold tracking-tighter sm:text-5xl short:text-4xl"
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div data-reveal="up" className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
            <p className="system-label flex items-center gap-3 text-foreground">
              <span className="h-px w-6 bg-primary" aria-hidden />
              {t("journey")}
            </p>
            <JourneyTabs
              entries={journey}
              label={t("journey")}
              currentLabel={t("current")}
              className="min-h-0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
