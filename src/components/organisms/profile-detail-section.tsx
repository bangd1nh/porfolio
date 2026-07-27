import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { CareerTimeline } from "@/components/molecules/career-timeline"
import { IdentityTerminal } from "@/components/molecules/identity-terminal"
import {
  ProfileMetaItem,
  profileMetaIcons,
} from "@/components/molecules/profile-meta"
import { experienceContent } from "@/data/experience"
import { profileContent } from "@/data/profile"
import { getLocale, getTranslations } from "next-intl/server"

type LocaleKey = "en" | "vi"

/**
 * Profile detail — content-sized (no nested scrollbars).
 */
export async function ProfileDetailSection() {
  const t = await getTranslations("profile")
  const tExperience = await getTranslations("experience")
  const locale = (await getLocale()) as LocaleKey
  const { name, birth, location, role, education } = profileContent

  const timelineEntries = [
    {
      id: "education",
      kind: "education" as const,
      title: t("fields.education"),
      subtitle: education[locale],
      period: "2021 – 2025",
    },
    ...experienceContent.map((item) => ({
      id: item.id,
      kind: "work" as const,
      title: tExperience(`items.${item.id}.company`),
      subtitle: tExperience(`items.${item.id}.role`),
      period: item.period,
      summary: tExperience(`items.${item.id}.summary`),
      bullets: item.bulletKeys.map((key) =>
        tExperience(
          `items.${item.id}.bullets.${key}` as Parameters<
            typeof tExperience
          >[0]
        )
      ),
      ...(item.githubUrl
        ? {
            linkHref: item.githubUrl,
            linkLabel: tExperience("repo"),
          }
        : {}),
    })),
  ]

  return (
    <section
      id="profile"
      className="page-section box-border content-start gap-y-4 border-t border-border pt-10 pb-10 sm:pt-12 sm:pb-12 lg:min-h-svh lg:gap-y-5 lg:pt-[var(--site-header-clearance)] lg:pb-10"
    >
      <header className="col-span-10 grid h-fit gap-y-2 self-start">
        <span className="w-fit justify-self-start border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {t("badge")}
        </span>
        <div className="grid gap-1">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base lg:whitespace-nowrap">
            {t("description")}
          </p>
        </div>
      </header>

      <div className="col-span-10 grid content-start grid-cols-10 items-stretch gap-x-[inherit] gap-y-6 lg:gap-y-8">
        <ScrollReveal className="col-span-10 grid grid-cols-1 content-start gap-3 md:col-span-4 md:h-0 md:min-h-full md:grid-rows-[auto_auto_auto_auto_minmax(0,1fr)] md:overflow-hidden">
          <h3 className="font-heading text-lg tracking-tight sm:text-xl md:text-2xl">
            {t("identity")}
          </h3>
          <ProfileMetaItem
            icon={profileMetaIcons.name}
            label={t("fields.name")}
            value={name[locale]}
          />
          <ProfileMetaItem
            icon={profileMetaIcons.role}
            label={t("fields.role")}
            value={role[locale]}
          />
          <div className="grid grid-cols-2 gap-3">
            <ProfileMetaItem
              icon={profileMetaIcons.birth}
              label={t("fields.birth")}
              value={birth}
            />
            <ProfileMetaItem
              icon={profileMetaIcons.location}
              label={t("fields.location")}
              value={location[locale]}
            />
          </div>
          <IdentityTerminal className="min-h-0 md:h-full" />
        </ScrollReveal>

        <ScrollReveal
          className="col-span-10 grid gap-3 md:col-span-6 md:pl-1"
          delayMs={40}
        >
          <h3 className="font-heading text-lg tracking-tight sm:text-xl md:text-2xl">
            {t("career")}
          </h3>
          <CareerTimeline entries={timelineEntries} />
        </ScrollReveal>
      </div>
    </section>
  )
}
