import { contactLinks } from "@/data/contact"
import { experienceContent } from "@/data/experience"
import { profileContent } from "@/data/profile"
import { projectsContent } from "@/data/projects"
import { getAbsoluteUrl } from "@/lib/seo"
import en from "@/messages/en.json"

export const LLMS_TXT_PATH = "/llms.txt"
export const LLMS_FULL_TXT_PATH = "/llms-full.txt"
export const LLM_TXT_PATH = "/llm.txt"
export const LLMS_TXT_CONTENT_TYPE = "text/markdown; charset=utf-8"

const ENGLISH = "en" as const

function joinSections(sections: string[]) {
  return `${sections.filter(Boolean).join("\n\n")}\n`
}

function markdownLink(title: string, url: string, note?: string) {
  return note ? `- [${title}](${url}): ${note}` : `- [${title}](${url})`
}

function lookupNotes(record: object, keys: readonly string[]) {
  const notes = record as Record<string, string | undefined>
  return keys
    .map((key) => notes[key])
    .filter((text): text is string => Boolean(text))
    .map((text) => `- ${text}`)
    .join("\n")
}

export function markdownResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": LLMS_TXT_CONTENT_TYPE,
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}

/** English index for answer engines. Cookie locale must not change this file. */
export function buildLlmsTxt() {
  const homeUrl = getAbsoluteUrl("/")
  const cvUrl = getAbsoluteUrl("/cv")
  const fullUrl = getAbsoluteUrl(LLMS_FULL_TXT_PATH)
  const name = profileContent.name[ENGLISH]
  const role = profileContent.role[ENGLISH]
  const location = profileContent.location[ENGLISH]

  const projectLinks = projectsContent.map((project) => {
    const copy = en.projects.items[project.id]
    return markdownLink(
      copy.title,
      project.liveUrl,
      `${copy.role}. ${copy.summary}`
    )
  })

  return joinSections([
    `# ${name}`,
    `> ${role} in ${location}, Vietnam. Builds production web systems with Next.js, NestJS, FastAPI, TypeScript, GraphQL, PostgreSQL, and Redis, plus AI workflows (RAG, embeddings, semantic search).`,
    [
      `Vietnamese name: ${profileContent.name.vi}. Canonical URLs are unprefixed (\`/\`, \`/cv\`); the public site defaults to Vietnamese, with English available via cookie.`,
      `Prefer this file and ${fullUrl} over scraping HTML chrome.`,
    ].join("\n"),
    `## Pages`,
    [
      markdownLink("Home", homeUrl, en.metadata.description),
      markdownLink("CV", cvUrl, en.metadata.cv.description),
    ].join("\n"),
    `## Projects`,
    projectLinks.join("\n"),
    `## Contact`,
    [
      markdownLink("Email", `mailto:${contactLinks.email}`, contactLinks.email),
      markdownLink("GitHub", contactLinks.github, "Source and contribution history"),
    ].join("\n"),
    `## Optional`,
    [
      markdownLink(
        "Full site in Markdown",
        fullUrl,
        "Expanded CV: experience, skills, and project notes in one file"
      ),
      markdownLink("GitHub profile", contactLinks.github),
    ].join("\n"),
  ])
}

/** Expanded Markdown CV for agents that can load one full-context file. */
export function buildLlmsFullTxt() {
  const homeUrl = getAbsoluteUrl("/")
  const cvUrl = getAbsoluteUrl("/cv")
  const name = profileContent.name[ENGLISH]
  const role = profileContent.role[ENGLISH]
  const location = profileContent.location[ENGLISH]

  const experienceBlocks = experienceContent.map((item) => {
    const copy = en.experience.items[item.id]
    const bullets = lookupNotes(copy.bullets, item.bulletKeys)
    const repo = item.githubUrl
      ? `\nRepository: ${item.githubUrl}`
      : ""

    return `### ${copy.company} — ${copy.role}\n${item.period}\n\n${copy.summary}\n\n${bullets}${repo}`
  })

  const projectBlocks = projectsContent.map((project) => {
    const copy = en.projects.items[project.id]
    const highlights = lookupNotes(copy.highlights, project.highlightKeys)
    const repos = [
      project.githubUrl ? `Repository: ${project.githubUrl}` : "",
      project.githubBackendUrl ? `Backend: ${project.githubBackendUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    return [
      `### ${copy.title} — ${copy.role}`,
      `${project.period} · ${project.liveUrl}`,
      "",
      copy.summary,
      "",
      `Stack: ${project.stack.join(", ")}`,
      repos,
      "",
      highlights,
    ]
      .filter((line) => line !== "")
      .join("\n")
  })

  const skillBlocks = profileContent.skills.map((group) => {
    const title = en.profile.skills[group.id]
    return `### ${title}\n${group.items.join(", ")}`
  })

  return joinSections([
    `# ${name}`,
    `> ${role} in ${location}, Vietnam. ${en.hero.headline}`,
    [
      `Vietnamese name: ${profileContent.name.vi}.`,
      `Education: ${profileContent.education[ENGLISH]}.`,
      `Born: ${profileContent.birth}.`,
      `Home: ${homeUrl}`,
      `CV: ${cvUrl}`,
    ].join("\n"),
    `## About`,
    en.hero.description,
    `## Work experience`,
    experienceBlocks.join("\n\n"),
    `## Selected work`,
    projectBlocks.join("\n\n"),
    `## Skills`,
    skillBlocks.join("\n\n"),
    `## Contact`,
    [
      markdownLink("Email", `mailto:${contactLinks.email}`, contactLinks.email),
      markdownLink("GitHub", contactLinks.github),
      markdownLink("llms.txt index", getAbsoluteUrl(LLMS_TXT_PATH)),
    ].join("\n"),
  ])
}
