import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import {
  ProfileSkillGroupCard,
  profileSkillIcons,
} from "@/components/molecules/profile-meta"
import { VIEWPORT_UNDER_HEADER } from "@/data/site"
import {
  featuredStackGroupIds,
  getSkillGroupsById,
  moreStackGroupIds,
  stackGroupSpans,
} from "@/data/stack"
import { getTranslations } from "next-intl/server"

/**
 * Featured stack — natural stack on phone/tablet; one viewport on desktop.
 */
export async function FeaturedStackSection() {
  const t = await getTranslations("stack")
  const tProfile = await getTranslations("profile")
  const skillsById = getSkillGroupsById()

  return (
    <section
      id="stack"
      className={`page-section box-border content-start gap-y-4 border-t border-border pt-10 pb-10 sm:gap-y-5 sm:pt-12 sm:pb-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-5 lg:overflow-hidden lg:pb-8 ${VIEWPORT_UNDER_HEADER}`}
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

      <div className="col-span-10 grid min-h-0 content-start gap-y-4 sm:gap-y-5 lg:gap-y-6">
        <div className="grid gap-3 md:gap-4">
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("featured")}
          </h3>
          <div className="grid grid-cols-10 gap-x-[inherit] gap-y-3 md:gap-y-4">
            {featuredStackGroupIds.map((id, index) => {
              const group = skillsById[id]
              if (!group) return null
              return (
                <ScrollReveal
                  key={id}
                  className={stackGroupSpans[id]}
                  delayMs={index * 20}
                >
                  <ProfileSkillGroupCard
                    compact
                    title={tProfile(`skills.${id}`)}
                    items={group.items}
                    icon={profileSkillIcons[id]}
                    className="h-full"
                  />
                </ScrollReveal>
              )
            })}
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {t("more")}
          </h3>
          <div className="grid grid-cols-10 gap-x-[inherit] gap-y-3 md:gap-y-4">
            {moreStackGroupIds.map((id, index) => {
              const group = skillsById[id]
              if (!group) return null
              return (
                <ScrollReveal
                  key={id}
                  className={stackGroupSpans[id]}
                  delayMs={index * 20}
                >
                  <ProfileSkillGroupCard
                    compact
                    title={tProfile(`skills.${id}`)}
                    items={group.items}
                    icon={profileSkillIcons[id]}
                    className="h-full"
                  />
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
