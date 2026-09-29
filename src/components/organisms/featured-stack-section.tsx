import {
  SectionHeading,
  SectionWatermark,
} from "@/components/molecules/section-heading"
import {
  SkillStackExplorer,
  skillKey,
} from "@/components/molecules/skill-stack-explorer"
import type { ProjectId } from "@/data/projects"
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

/** Pipeline order: encode → retrieve → augment → generate. */
const AI_SYSTEMS = [
  "Embeddings",
  "Vector Search",
  "RAG",
  "LLM tooling",
] as const

const ADDITIONAL = [
  "Java",
  "Spring Boot",
  "React Native",
  "Android",
  "C",
] as const

/** Case studies built on the embeddings → vector search → RAG pipeline. */
const AI_PROJECT_IDS = ["uctalent", "matchtutors"] as const satisfies readonly ProjectId[]

/** Recruiter-first skill hierarchy; the complete inventory remains in the CV. */
export async function FeaturedStackSection() {
  const t = await getTranslations("stack")
  const tProjects = await getTranslations("projects")
  // Object namespace — typed keys only cover leaf messages.
  const roleMessages = t.raw("roles" as Parameters<typeof t.raw>[0]) as Record<string, string>
  const roles = Object.fromEntries(
    [...PRIMARY, ...PRODUCTION_EXPERIENCE, ...AI_SYSTEMS, ...ADDITIONAL]
      .map((name) => [skillKey(name), roleMessages[skillKey(name)]] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1]))
  )

  return (
    <section
      id="stack"
      data-screen
      className={`page-section box-border content-start gap-y-7 pt-10 pb-24 sm:gap-y-8 sm:pt-12 lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-y-5 lg:py-8 [@media(min-width:1024px)_and_(max-height:50rem)]:gap-y-3 [@media(min-width:1024px)_and_(max-height:50rem)]:py-6 ${VIEWPORT_SECTION}`}
    >
      <SectionWatermark index={4} />
      <SectionHeading
        index={4}
        label={t("badge")}
        title={t("title")}
        description={t("description")}
        titleClassName="[@media(min-width:1024px)_and_(max-height:50rem)]:text-4xl"
      />

      <SkillStackExplorer
        primary={PRIMARY}
        productionExperience={PRODUCTION_EXPERIENCE}
        aiSystems={AI_SYSTEMS}
        additional={ADDITIONAL}
        roles={roles}
        aiProjects={AI_PROJECT_IDS.map((id) => ({
          id,
          title: tProjects(`items.${id}.title`),
        }))}
        labels={{
          primary: t("primary"),
          productionExperience: t("productionExperience"),
          aiSystems: t("aiSystems"),
          additional: t("additional"),
          primaryStatus: t("primaryStatus"),
          productionStatus: t("productionStatus"),
          aiStatus: t("aiStatus"),
          additionalStatus: t("additionalStatus"),
          pipelineIn: t("pipelineIn"),
          pipelineOut: t("pipelineOut"),
          usedIn: t("usedIn"),
        }}
      />
    </section>
  )
}
