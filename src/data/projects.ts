export type ProjectId = "guscent" | "uctalent" | "unchainlabs" | "matchtutors"

export type ProjectItem = {
  id: ProjectId
  /** Message key under `projects.items.<id>` for title/summary/highlights */
  liveUrl: string
  /** Primary repo (often frontend). */
  githubUrl?: string | undefined
  /** Optional backend / second repo. */
  githubBackendUrl?: string | undefined
  period: string
  teamSize: number
  stack: readonly string[]
  /** Keys under `projects.items.<id>.highlights.*` */
  highlightKeys: readonly string[]
}

/** Featured projects — copy lives in messages; facts live here. */
export const projectsContent: readonly ProjectItem[] = [
  {
    id: "guscent",
    liveUrl: "https://guscent.vn",
    period: "06/2026 – 08/2026",
    teamSize: 3,
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "REST API",
      "SEO",
      "Responsive UI",
    ],
    highlightKeys: ["shipped", "decisions", "impact"],
  },
  {
    id: "uctalent",
    liveUrl: "https://uctalent.io",
    githubUrl: "https://github.com/UCTalent",
    period: "03/2026 – Present",
    teamSize: 6,
    stack: [
      "Next.js",
      "React",
      "NestJS",
      "FastAPI",
      "GraphQL",
      "PostgreSQL",
      "Redis",
      "Elasticsearch",
      "LLM",
      "Vector search",
    ],
    highlightKeys: ["shipped", "decisions", "impact"],
  },
  {
    id: "unchainlabs",
    liveUrl: "https://unchain-labs.com",
    githubUrl: "https://github.com/UCTalent/ucl-web",
    githubBackendUrl: "https://github.com/UCTalent/ucl-web-cms",
    period: "03/2026 – Present",
    teamSize: 1,
    stack: [
      "Next.js",
      "Strapi",
      "TypeScript",
      "PostgreSQL",
      "REST API",
      "SEO",
      "Tailwind CSS",
    ],
    highlightKeys: ["shipped", "decisions", "impact"],
  },
  {
    id: "matchtutors",
    liveUrl: "https://match-tutors.vercel.app",
    githubUrl: "https://github.com/bangd1nh/MatchTutors",
    githubBackendUrl: "https://github.com/bangd1nh/match_Tutor_BE",
    period: "09/2025 – 12/2025",
    teamSize: 4,
    stack: [
      "React",
      "Vite",
      "TypeScript",
      "Express",
      "MongoDB",
      "Redis",
      "BullMQ",
      "Socket.io",
      "OpenAI",
    ],
    highlightKeys: ["shipped", "decisions", "impact"],
  },
]
