export type TerminalBootStep = {
  cmd: string
  out: readonly string[]
}

/** Decorative shell session for the Identity terminal — not primary content. */
export const TERMINAL_PROMPT = "bang@portfolio:~$"

export const terminalBootSteps: readonly TerminalBootStep[] = [
  {
    cmd: "date",
    out: ["Sat Jul 26 01:22:08 +07 2026"],
  },
  {
    cmd: "node -v && pnpm -v",
    out: ["v22.14.0", "10.12.1"],
  },
  {
    cmd: "ls",
    out: ["apps/", "packages/", "package.json", "pnpm-lock.yaml", "turbo.json"],
  },
  {
    cmd: "pnpm --filter web dev",
    out: [
      "> web@0.1.0 dev",
      "> next dev --turbopack",
      "",
      "  ▲ Next.js 16.0.0",
      "  - Local:    http://localhost:3000",
      "  ✓ Ready in 812ms",
    ],
  },
  {
    cmd: "git log --oneline -4",
    out: [
      "a8f3c21 refine identity terminal layout",
      "4e91b0d tighten profile grid stretch",
      "c2d7a55 add career timeline polish",
      "19b6e44 ship homepage section pager",
    ],
  },
  {
    cmd: "curl -sI http://localhost:3000 | head -n 3",
    out: ["HTTP/1.1 200 OK", "Content-Type: text/html; charset=utf-8", "Cache-Control: no-store"],
  },
  {
    cmd: "docker ps --format 'table {{.Names}}\\t{{.Status}}'",
    out: [
      "NAMES          STATUS",
      "postgres-dev   Up 3 hours",
      "redis-cache    Up 3 hours",
    ],
  },
  {
    cmd: "clear",
    out: [],
  },
] as const
