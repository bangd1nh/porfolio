export type ProjectId = "guscent" | "uctalent" | "unchainlabs" | "matchtutors"

/** Homepage bento — large cell for this project. */
export const FEATURED_PROJECT_ID: ProjectId = "uctalent"

export type ProjectProofKey =
  | "production"
  | "responsive"
  | "cmsIntegration"
  | "semanticSearch"
  | "aiWorkflows"
  | "seoReady"
  | "realtime"
  | "awsDeployment"
  | "saasModel"
  | "rbac"
  | "ats"
  | "dbMigrations"

export type ProjectLiveLink = {
  url: string
  /** Key under `projects.*` in messages — e.g. liveAts */
  labelKey: string
}

export type ProjectItem = {
  id: ProjectId
  /** Local asset under `public/` — e.g. `/projects/uctalent-icon.png` */
  icon: string
  liveUrl: string
  previewUrl?: string | undefined
  liveLinks?: readonly ProjectLiveLink[]
  githubUrl?: string | undefined
  githubBackendUrl?: string | undefined
  period: string
  teamSize: number
  stack: readonly string[]
  proofKeys: readonly ProjectProofKey[]
  highlightKeys: readonly string[]
  bulletKeys: readonly string[]
}

/** Featured projects — copy lives in messages; facts live here. */
export const projectsContent: readonly ProjectItem[] = [
  {
    id: "uctalent",
    icon: "/projects/uctalent-icon.png",
    liveUrl: "https://uctalent.io",
    previewUrl: "https://business.uctalent.io",
    liveLinks: [
      { url: "https://business.uctalent.io", labelKey: "liveAts" },
    ],
    period: "02/2026 – Present",
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
    proofKeys: [
      "production",
      "saasModel",
      "ats",
      "semanticSearch",
      "aiWorkflows",
    ],
    highlightKeys: ["shipped", "decisions", "impact"],
    bulletKeys: ["highlight1", "highlight2", "highlight3", "highlight4"],
  },
  {
    id: "guscent",
    icon: "/projects/guscent-icon.jpg",
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
    proofKeys: ["production", "responsive", "cmsIntegration"],
    highlightKeys: ["shipped", "decisions", "impact"],
    bulletKeys: ["highlight1", "highlight2", "highlight3"],
  },
  {
    id: "unchainlabs",
    icon: "/projects/unchainlabs-icon.png",
    liveUrl: "https://unchain-labs.com",
    period: "02/2026 – Present",
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
    proofKeys: ["production", "cmsIntegration", "seoReady"],
    highlightKeys: ["shipped", "decisions", "impact"],
    bulletKeys: ["highlight1", "highlight2", "highlight3"],
  },
  {
    id: "matchtutors",
    icon: "/projects/matchtutors-icon.png",
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
    proofKeys: ["realtime", "aiWorkflows", "awsDeployment"],
    highlightKeys: ["shipped", "decisions", "impact"],
    bulletKeys: ["highlight1", "highlight2", "highlight3"],
  },
]
