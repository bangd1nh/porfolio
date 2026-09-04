import { ScrollReveal } from "@/components/atoms/scroll-reveal"
import { SkillStackExplorer } from "@/components/molecules/skill-stack-explorer"
import { VIEWPORT_SECTION } from "@/data/site"
import { getTranslations } from "next-intl/server"

const PRIMARY = [
  "TypeScript",
  "Next.js",
  "React",
  "NestJS",
  "PostgreSQL",
] as const

const PRODUCTION_EXPERIENCE = [
  "Redis",
  "Elasticsearch",
  "GraphQL",
  "FastAPI",
  "Docker",
] as const

const AI_SYSTEMS = [
  "RAG",
  "Embeddings",
  "Vector Search",
  "LLM tooling",
] as const

const ADDITIONAL = [
  "Java",
  "Spring Boot",
  "React Native",
  "Android",
  "C",
] as const

/** Recruiter-first skill hierarchy; the complete inventory remains in the CV. */
export async function FeaturedStackSection() {
  const t = await getTranslations("stack")

  return (
    <section
      id="stack"
      className={`page-section box-border content-start gap-y-7 border-t border-border py-8 sm:gap-y-9 sm:py-10 lg:gap-y-5 lg:py-8 ${VIEWPORT_SECTION}`}
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
          primary={PRIMARY}
          productionExperience={PRODUCTION_EXPERIENCE}
          aiSystems={AI_SYSTEMS}
          additional={ADDITIONAL}
          labels={{
            primary: t("primary"),
            productionExperience: t("productionExperience"),
            aiSystems: t("aiSystems"),
            additional: t("additional"),
            primaryStatus: t("primaryStatus"),
            productionStatus: t("productionStatus"),
            aiStatus: t("aiStatus"),
            additionalStatus: t("additionalStatus"),
          }}
        />
      </ScrollReveal>
    </section>
  )
}
