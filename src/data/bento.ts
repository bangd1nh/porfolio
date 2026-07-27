import type { LucideIcon } from "lucide-react"
import {
  AppWindow,
  Bot,
  Code2,
  FileCode2,
  GitBranch,
  GitCommitHorizontal,
  Globe2,
  GraduationCap,
  KeyRound,
  Layers,
  MapPin,
  Radio,
  ScanSearch,
  Server,
  ServerCog,
  Share2,
  ShieldCheck,
  Triangle,
  Wifi,
} from "lucide-react"

import { profileContent } from "@/data/profile"

export type BentoStackItem = {
  name: string
  icon: LucideIcon
}

export type BentoStackGroup = {
  id: "frameworks" | "api" | "security"
  label: string
  icon: LucideIcon
  items: readonly BentoStackItem[]
}

export type BentoContent = {
  avatar: {
    src?: string
    initials: string
    alt: string
  }
  stack: {
    title: string
    /** Skills shown per group in the collage; leftover groups get "…". */
    visiblePerGroup: number
    groups: readonly BentoStackGroup[]
  }
  experience: {
    value: string
    label: string
  }
  education: {
    title: string
    value: {
      vi: string
      en: string
    }
  }
  location: {
    city: {
      vi: string
      en: string
    }
    note: {
      vi: string
      en: string
    }
  }
  ai: {
    title: string
    visibleCount: number
    items: readonly string[]
  }
  github: {
    title: string
    /** Fallback when `GITHUB_TOKEN` is missing / API fails. */
    repos: number
    stars: number
    openPullRequests: number
    contributions: number
  }
}

/** Flattened skill rows (items only) for the collage teaser. */
export type BentoStackTeaserItem = {
  name: string
  icon: LucideIcon
  groupId: BentoStackGroup["id"]
  groupLabel: string
  groupIcon: LucideIcon
  isGroupStart: boolean
}

export type BentoStackTeaserGroup = {
  id: BentoStackGroup["id"]
  label: string
  items: BentoStackTeaserItem[]
  hasMore: boolean
}

/** Peek `perGroup` skills from every stack group for the collage sticker. */
export function getStackTeaserGroups(
  groups: readonly BentoStackGroup[],
  perGroup: number
): BentoStackTeaserGroup[] {
  return groups.map((group) => {
    const take = Math.min(perGroup, group.items.length)
    const items = group.items.slice(0, take).map((item, index) => ({
      name: item.name,
      icon: item.icon,
      groupId: group.id,
      groupLabel: group.label,
      groupIcon: group.icon,
      isGroupStart: index === 0,
    }))

    return {
      id: group.id,
      label: group.label,
      items,
      hasMore: group.items.length > take,
    }
  })
}

/** Hero collage preview — teaser only; full detail lives in `#profile`. */
export const bentoContent = {
  avatar: {
    // Drop a portrait at /public/avatar.jpg and set src: "/avatar.jpg"
    src: undefined as string | undefined,
    initials: "NB",
    alt: "Portrait",
  },
  stack: {
    title: "Current stack",
    visiblePerGroup: 3,
    groups: [
      {
        id: "frameworks",
        label: "Frameworks",
        icon: Layers,
        items: [
          { name: "TypeScript", icon: FileCode2 },
          { name: "Next.js", icon: Triangle },
          { name: "NestJS", icon: Server },
          { name: "React", icon: Code2 },
          { name: "Spring Boot", icon: ServerCog },
          { name: "FastAPI", icon: Server },
          { name: "React Native", icon: Code2 },
          { name: "Express.js", icon: ServerCog },
        ],
      },
      {
        id: "api",
        label: "API & rendering",
        icon: Share2,
        items: [
          { name: "GraphQL", icon: Share2 },
          { name: "REST API", icon: Globe2 },
          { name: "WebSocket", icon: Radio },
          { name: "SSE", icon: Wifi },
          { name: "SSR", icon: ServerCog },
          { name: "CSR", icon: AppWindow },
        ],
      },
      {
        id: "security",
        label: "Security",
        icon: ShieldCheck,
        items: [
          { name: "JWT", icon: KeyRound },
          { name: "Authentication", icon: ShieldCheck },
          { name: "Gitleaks", icon: ScanSearch },
          { name: "Husky", icon: GitCommitHorizontal },
        ],
      },
    ],
  },
  experience: {
    value: "1+",
    label: "years building web apps",
  },
  education: {
    title: "Education",
    value: profileContent.education,
  },
  location: {
    city: profileContent.location,
    note: {
      vi: "Sẵn sàng remote",
      en: "Open to remote work",
    },
  },
  ai: {
    title: "AI focus",
    visibleCount: 2,
    items: ["Agentic AI", "RAG", "Semantic search", "Prompt engineering"],
  },
  github: {
    title: "GitHub",
    repos: 20,
    stars: 4,
    openPullRequests: 0,
    contributions: 45,
  },
} as const satisfies BentoContent

export const bentoIcons = {
  location: MapPin,
  github: GitBranch,
  education: GraduationCap,
  ai: Bot,
} as const
