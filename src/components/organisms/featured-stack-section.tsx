import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { SkillStackExplorer } from "@/components/molecules/skill-stack-explorer"
import { profileContent } from "@/data/profile"
import { getTranslations } from "next-intl/server"

const DAILY_DRIVERS = [
  "TypeScript",
  "Next.js",
  "NestJS",
  "PostgreSQL",
  "Redis",
  "Docker",
] as const

const AI_SYSTEMS = [
  "Agentic AI",
  "RAG",
  "Embeddings",
  "Semantic search",
] as const

/** Strongest capabilities first; the complete source inventory remains expandable. */
export async function FeaturedStackSection() {
  const t = await getTranslations("stack")
  const tProfile = await getTranslations("profile")
  const featuredItems = new Set<string>([...DAILY_DRIVERS, ...AI_SYSTEMS])
  const remainingGroups = profileContent.skills
    .map((group) => ({
      id: group.id,
      title: tProfile(`skills.${group.id}`),
      items: group.items.filter((item) => !featuredItems.has(item)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <section
      id="stack"
      className="page-section box-border min-h-svh content-start gap-y-7 border-t border-border py-12 sm:gap-y-9 sm:py-16 lg:py-20"
    >
      <header className="col-span-10 grid h-fit gap-y-3 self-start">
        <p className="system-label text-foreground">SYSTEM / {t("badge")}</p>
        <div className="grid gap-2">
          <h2 className="section-title">{t("title")}</h2>
          <p className="section-description">{t("description")}</p>
        </div>
      </header>

      <ScrollReveal className="col-span-10">
        <SkillStackExplorer
          dailyDrivers={DAILY_DRIVERS}
          aiSystems={AI_SYSTEMS}
          groups={remainingGroups}
          labels={{
            dailyDrivers: t("dailyDrivers"),
            aiSystems: t("aiSystems"),
            dailyStatus: t("dailyStatus"),
            aiStatus: t("aiStatus"),
            viewFull: t("viewFull"),
            hideFull: t("hideFull"),
          }}
        />
      </ScrollReveal>
    </section>
  )
}
