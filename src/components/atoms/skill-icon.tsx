import type { LucideIcon } from "lucide-react"
import {
  AppWindow,
  Binary,
  Bot,
  FileCode2,
  GitCommitHorizontal,
  Globe2,
  KeyRound,
  Library,
  MessageSquareCode,
  Radio,
  ScanSearch,
  Search,
  ServerCog,
  ShieldCheck,
  WandSparkles,
  Wifi,
} from "lucide-react"
import type { SimpleIcon } from "simple-icons"
import {
  siAndroid,
  siC,
  siDocker,
  siElasticsearch,
  siExpress,
  siFastapi,
  siGit,
  siGithub,
  siGraphql,
  siJavascript,
  siLinux,
  siMongodb,
  siMysql,
  siN8n,
  siNestjs,
  siNextdotjs,
  siOpenjdk,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siSpringboot,
  siTailwindcss,
  siTypescript,
} from "simple-icons"

import { cn } from "@/lib/utils"

type SkillIconSource =
  | { kind: "lucide"; icon: LucideIcon }
  | { kind: "simple"; icon: SimpleIcon }

/**
 * Brand logos → Simple Icons (SVG). Concepts → Lucide.
 * Explicit exception to UI-only Lucide rule for recognizable tech marks.
 */
const SKILL_ICONS: Record<string, SkillIconSource> = {
  // Languages
  Java: { kind: "simple", icon: siOpenjdk },
  Python: { kind: "simple", icon: siPython },
  C: { kind: "simple", icon: siC },
  JavaScript: { kind: "simple", icon: siJavascript },
  TypeScript: { kind: "simple", icon: siTypescript },

  // Databases
  MySQL: { kind: "simple", icon: siMysql },
  MongoDB: { kind: "simple", icon: siMongodb },
  Elasticsearch: { kind: "simple", icon: siElasticsearch },
  PostgreSQL: { kind: "simple", icon: siPostgresql },
  Redis: { kind: "simple", icon: siRedis },

  // Frameworks
  "Next.js": { kind: "simple", icon: siNextdotjs },
  NestJS: { kind: "simple", icon: siNestjs },
  React: { kind: "simple", icon: siReact },
  "React Native": { kind: "simple", icon: siReact },
  Android: { kind: "simple", icon: siAndroid },
  "Express.js": { kind: "simple", icon: siExpress },
  FastAPI: { kind: "simple", icon: siFastapi },
  "Spring Boot": { kind: "simple", icon: siSpringboot },
  "Tailwind CSS": { kind: "simple", icon: siTailwindcss },

  // API & rendering
  GraphQL: { kind: "simple", icon: siGraphql },
  "REST API": { kind: "lucide", icon: Globe2 },
  WebSocket: { kind: "lucide", icon: Radio },
  SSE: { kind: "lucide", icon: Wifi },
  SSR: { kind: "lucide", icon: ServerCog },
  CSR: { kind: "lucide", icon: AppWindow },

  // Security
  JWT: { kind: "lucide", icon: KeyRound },
  Authentication: { kind: "lucide", icon: ShieldCheck },
  Gitleaks: { kind: "lucide", icon: ScanSearch },
  Husky: { kind: "lucide", icon: GitCommitHorizontal },

  // Tools
  Git: { kind: "simple", icon: siGit },
  GitHub: { kind: "simple", icon: siGithub },

  // AI
  "Agentic AI": { kind: "lucide", icon: Bot },
  "AI driven": { kind: "lucide", icon: WandSparkles },
  RAG: { kind: "lucide", icon: Library },
  "Semantic search": { kind: "lucide", icon: Search },
  "Prompt engineering": { kind: "lucide", icon: MessageSquareCode },
  "LLM tooling": { kind: "lucide", icon: WandSparkles },
  Embeddings: { kind: "lucide", icon: Binary },
  "Vector databases": { kind: "lucide", icon: ServerCog },

  // Other
  Linux: { kind: "simple", icon: siLinux },
  Docker: { kind: "simple", icon: siDocker },
  n8n: { kind: "simple", icon: siN8n },
}

type SkillIconProps = {
  name: string
  className?: string
}

/** Renders the icon for a skill label (Lucide or Simple Icons SVG). */
export function SkillIcon({ name, className }: SkillIconProps) {
  const entry = SKILL_ICONS[name]

  if (!entry) {
    return <FileCode2 className={cn("size-3.5 shrink-0", className)} aria-hidden />
  }

  if (entry.kind === "lucide") {
    const Icon = entry.icon
    return <Icon className={cn("size-3.5 shrink-0", className)} aria-hidden />
  }

  const { path, title } = entry.icon
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-3.5 shrink-0 fill-current", className)}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  )
}
