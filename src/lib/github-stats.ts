export type GithubContributionDay = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export type GithubContributionWeek = {
  days: GithubContributionDay[]
}

export type GithubOrganization = {
  login: string
  name: string
  avatarUrl: string
  url: string
}

export type GithubStats = {
  repos: number
  stars: number
  /** Open pull requests authored by the authenticated user (read-only count). */
  openPullRequests: number
  /** Total contributions in the selected window (default: last 6 months). */
  contributions: number
  /** Contribution weeks for the heatmap (Sun→Sat columns). */
  weeks: GithubContributionWeek[]
  organizations: GithubOrganization[]
  /**
   * True when GitHub reports private/restricted activity that this token
   * cannot expand into day cells (usually fine-grained PAT).
   */
  privateHidden: boolean
}

type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE"

type CalendarWeek = {
  contributionDays: Array<{
    date: string
    contributionCount: number
    contributionLevel: ContributionLevel
  }>
}

type ContributionsCollection = {
  hasAnyRestrictedContributions: boolean
  restrictedContributionsCount: number
  contributionCalendar: {
    totalContributions: number
    weeks: CalendarWeek[]
  }
}

type GithubGraphqlResponse = {
  data?: {
    viewer?: {
      login: string
      contributionsCollection: ContributionsCollection
      pullRequests: {
        totalCount: number
      }
    }
    user?: {
      repositories: {
        totalCount: number
        nodes: Array<{ stargazerCount: number }>
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
      organizations: {
        nodes: Array<{
          login: string
          name: string | null
          avatarUrl: string
          url: string
        } | null>
      }
    } | null
  }
  errors?: Array<{ message: string }>
}

const LEVEL_MAP: Record<ContributionLevel, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

/** Orgs that may not appear via API (private membership) — still shown on the site. */
export const githubOrgFallback: readonly GithubOrganization[] = [
  {
    login: "UCTalent",
    name: "Unchain Talent Lab",
    avatarUrl: "https://avatars.githubusercontent.com/u/120438463?v=4",
    url: "https://github.com/UCTalent",
  },
  {
    login: "sfastvn",
    name: "sfastvn",
    avatarUrl: "https://avatars.githubusercontent.com/u/233226459?v=4",
    url: "https://github.com/sfastvn",
  },
]

/**
 * Contributions must come from `viewer` (not `user(login:)`) so a classic
 * PAT with `read:user` can include private/internal activity in the calendar.
 */
const PROFILE_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!, $after: String) {
    viewer {
      login
      pullRequests(states: OPEN) {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        hasAnyRestrictedContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
    user(login: $login) {
      repositories(
        ownerAffiliations: OWNER
        isFork: false
        first: 100
        after: $after
      ) {
        totalCount
        nodes { stargazerCount }
        pageInfo { hasNextPage endCursor }
      }
      organizations(first: 20) {
        nodes {
          login
          name
          avatarUrl
          url
        }
      }
    }
  }
`

function monthsAgoIso(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date.toISOString()
}

function mapWeeks(weeks: CalendarWeek[]): GithubContributionWeek[] {
  return weeks.map((week) => ({
    days: week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel] ?? 0,
    })),
  }))
}

function mergeOrganizations(
  fromApi: GithubOrganization[],
  fallback: readonly GithubOrganization[]
): GithubOrganization[] {
  const byLogin = new Map<string, GithubOrganization>()
  for (const org of fallback) {
    byLogin.set(org.login.toLowerCase(), org)
  }
  for (const org of fromApi) {
    byLogin.set(org.login.toLowerCase(), org)
  }
  return Array.from(byLogin.values())
}

async function fetchGithubPage(args: {
  login: string
  token: string
  from: string
  to: string
  after: string | null
}): Promise<GithubGraphqlResponse> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-github-stats",
    },
    body: JSON.stringify({
      query: PROFILE_QUERY,
      variables: {
        login: args.login,
        from: args.from,
        to: args.to,
        after: args.after,
      },
    }),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}`)
  }

  return (await res.json()) as GithubGraphqlResponse
}

/**
 * Live GitHub stats for the portfolio.
 * Requires `GITHUB_USERNAME` + `GITHUB_TOKEN` (server-only).
 *
 * Full heatmap (incl. private): Classic PAT with `read:user` (+ `repo` if
 * needed) and Profile → “Include private contributions on my profile”.
 * Fine-grained tokens usually cannot expand private days into the calendar.
 */
export async function getGithubStats(): Promise<GithubStats | null> {
  const login = process.env.GITHUB_USERNAME
  const token = process.env.GITHUB_TOKEN

  if (!login || !token) {
    return null
  }

  const from = monthsAgoIso(6)
  const to = new Date().toISOString()

  try {
    let after: string | null = null
    let repos = 0
    let stars = 0
    let openPullRequests = 0
    let contributions = 0
    let weeks: GithubContributionWeek[] = []
    let organizations: GithubOrganization[] = []
    let privateHidden = false
    let pages = 0

    do {
      const json = await fetchGithubPage({ login, token, from, to, after })

      if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "))
      }

      const viewer = json.data?.viewer
      const user = json.data?.user
      if (!user) {
        throw new Error(`GitHub user not found: ${login}`)
      }

      if (pages === 0) {
        if (!viewer) {
          throw new Error("GitHub viewer unavailable for this token")
        }

        if (viewer.login.toLowerCase() !== login.toLowerCase()) {
          console.warn(
            `[github-stats] Token viewer (${viewer.login}) ≠ GITHUB_USERNAME (${login}). Private contributions will not appear.`
          )
        }

        const collection = viewer.contributionsCollection
        const calendar = collection.contributionCalendar
        contributions = calendar.totalContributions
        weeks = mapWeeks(calendar.weeks)
        openPullRequests = viewer.pullRequests.totalCount
        privateHidden =
          collection.hasAnyRestrictedContributions ||
          collection.restrictedContributionsCount > 0

        if (privateHidden) {
          console.warn(
            `[github-stats] Restricted/private contributions detected (${collection.restrictedContributionsCount}). Use a Classic PAT with read:user so day cells include private activity.`
          )
        }

        repos = user.repositories.totalCount
        organizations = user.organizations.nodes
          .filter((node): node is NonNullable<typeof node> => Boolean(node))
          .map((node) => ({
            login: node.login,
            name: node.name ?? node.login,
            avatarUrl: node.avatarUrl,
            url: node.url,
          }))
      }

      stars += user.repositories.nodes.reduce(
        (sum, node) => sum + node.stargazerCount,
        0
      )

      const { hasNextPage, endCursor } = user.repositories.pageInfo
      after = hasNextPage ? endCursor : null
      pages += 1
    } while (after && pages < 10)

    return {
      repos,
      stars,
      openPullRequests,
      contributions,
      weeks,
      organizations: mergeOrganizations(organizations, githubOrgFallback),
      privateHidden,
    }
  } catch (error) {
    console.error("[github-stats]", error)
    return null
  }
}
