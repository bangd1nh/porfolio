export type ProjectId = "guscent" | "uctalent" | "unchainlabs" | "matchtutors"

export const PROJECT_SELECTION_EVENT = "portfolio-project-select"

/** Default tab + visual emphasis in Selected Work. */
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

export type ProjectPreviewType = "iframe" | "image" | "auto"

export type ProjectItem = {
  id: ProjectId
  /** Message key under `projects.items.<id>` for title/summary/highlights */
  /** Primary outbound / “Live site” CTA URL. */
  liveUrl: string
  /**
   * URL shown in the preview chrome and used for embed checks.
   * Defaults to `liveUrl` when omitted (e.g. ATS workspace for UCTalent).
   */
  previewUrl?: string | undefined
  /** How to render the showcase preview — iframe on desktop or static image. */
  previewType: ProjectPreviewType
  /**
   * Screenshot fallback in `public/projects/` — e.g. `/projects/guscent.webp`.
   * Shown for `image` previews, on mobile, and while iframe loads / on timeout.
   */
  previewImage: string
  /** Used when `previewImage` fails to load (e.g. missing local screenshot). */
  previewImageFallback?: string | undefined
  /** Additional production URLs (e.g. ATS workspace beside marketing site). */
  liveLinks?: readonly ProjectLiveLink[]
  /** Primary repo (often frontend). */
  githubUrl?: string | undefined
  /** Optional backend / second repo. */
  githubBackendUrl?: string | undefined
  period: string
  teamSize: number
  stack: readonly string[]
  /** Existing, verifiable outcomes rendered as compact proof chips. */
  proofKeys: readonly ProjectProofKey[]
  /** Keys under `projects.items.<id>.highlights.*` */
  highlightKeys: readonly string[]
  /** Keys under `projects.items.<id>.bullets.*` — HR scan list (2–3 items) */
  bulletKeys: readonly string[]
}

/** Featured projects — copy lives in messages; facts live here. */
export const projectsContent: readonly ProjectItem[] = [
  {
    id: "uctalent",
    liveUrl: "https://uctalent.io",
    previewUrl: "https://business.uctalent.io",
    previewType: "image",
    previewImage: "/projects/uctalent.webp",
    previewImageFallback: "https://uctalent.io/uctalent-logo.png",
    liveLinks: [
      { url: "https://business.uctalent.io", labelKey: "liveAts" },
    ],
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
    liveUrl: "https://guscent.vn",
    previewType: "iframe",
    previewImage: "/projects/guscent.webp",
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
    liveUrl: "https://unchain-labs.com",
    previewType: "image",
    previewImage: "/projects/unchainlabs.webp",
    previewImageFallback:
      "https://unchain-labs.com/images/Unchain-labs-logo_thumbnail.png",
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
    proofKeys: ["production", "cmsIntegration", "seoReady"],
    highlightKeys: ["shipped", "decisions", "impact"],
    bulletKeys: ["highlight1", "highlight2", "highlight3"],
  },
  {
    id: "matchtutors",
    liveUrl: "https://match-tutors.vercel.app",
    previewType: "iframe",
    previewImage: "/projects/matchtutors.webp",
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
