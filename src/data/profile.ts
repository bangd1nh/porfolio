export type ProfileSkillGroup = {
  id:
    | "languages"
    | "databases"
    | "frameworks"
    | "api"
    | "security"
    | "other"
    | "ai"
  items: readonly string[]
}

export type ProfileContent = {
  name: {
    vi: string
    en: string
  }
  birth: string
  location: {
    vi: string
    en: string
  }
  role: {
    vi: string
    en: string
  }
  education: {
    vi: string
    en: string
  }
  skills: readonly ProfileSkillGroup[]
}

/** Profile detail — full skill inventory (not JD-trimmed). */
export const profileContent = {
  name: {
    vi: "Nguyễn Đình Bảng",
    en: "Nguyen Dinh Bang",
  },
  birth: "01/2003",
  location: {
    vi: "Đà Nẵng",
    en: "Da Nang",
  },
  role: {
    vi: "Fullstack Developer",
    en: "Fullstack Developer",
  },
  education: {
    vi: "FPT University Đà Nẵng · 2021 – 2025",
    en: "FPT University Da Nang · 2021 – 2025",
  },
  skills: [
    {
      id: "languages",
      items: ["Java", "Python", "C", "JavaScript", "TypeScript"],
    },
    {
      id: "databases",
      items: ["MySQL", "MongoDB", "Elasticsearch", "PostgreSQL", "Redis"],
    },
    {
      id: "frameworks",
      items: [
        "Next.js",
        "NestJS",
        "React",
        "React Native",
        "Android",
        "Express.js",
        "FastAPI",
        "Spring Boot",
        "Tailwind CSS",
      ],
    },
    {
      id: "api",
      items: ["GraphQL", "REST API", "WebSocket", "SSE", "SSR", "CSR"],
    },
    {
      id: "security",
      items: ["JWT", "Authentication", "Gitleaks", "Husky"],
    },
    {
      id: "other",
      items: ["Git", "GitHub", "Linux", "Docker", "n8n"],
    },
    {
      id: "ai",
      items: [
        "Agentic AI",
        "AI driven",
        "RAG",
        "Semantic search",
        "Prompt engineering",
        "LLM tooling",
        "Embeddings",
        "Vector databases",
      ],
    },
  ],
} as const satisfies ProfileContent
