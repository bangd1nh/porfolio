import type { ProjectPreviewType } from "@/data/projects"
import { getSiteUrl } from "@/lib/site-url"

export type EmbeddabilityResult = {
  embedAllowed: boolean
  reason?: string | undefined
}

const embeddabilityCache = new Map<string, EmbeddabilityResult>()

const FETCH_TIMEOUT_MS = 5000

function normalizeOrigin(origin: string): string {
  try {
    return new URL(origin).origin
  } catch {
    return origin
  }
}

function parseFrameAncestors(csp: string): string | null {
  const match = csp.match(/frame-ancestors\s+([^;]+)/i)
  return match?.[1]?.trim() ?? null
}

function frameAncestorsAllowsEmbed(
  directive: string,
  embedderOrigin: string
): boolean {
  const tokens = directive.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return true

  if (tokens.includes("'none'")) return false
  if (tokens.includes("*")) return true

  const embedder = normalizeOrigin(embedderOrigin)

  for (const token of tokens) {
    if (token === "'self'") continue

    if (token === "https:" && embedder.startsWith("https://")) return true
    if (token === "http:" && embedder.startsWith("http://")) return true

    try {
      const allowedOrigin = new URL(token).origin
      if (allowedOrigin === embedder) return true
    } catch {
      // ignore invalid source tokens
    }
  }

  return false
}

function evaluateHeaders(
  headers: Headers,
  embedderOrigin: string
): EmbeddabilityResult {
  const xfo = headers.get("x-frame-options")?.trim().toLowerCase()
  if (xfo === "deny") {
    return { embedAllowed: false, reason: "x-frame-options: deny" }
  }
  if (xfo === "sameorigin") {
    return { embedAllowed: false, reason: "x-frame-options: sameorigin" }
  }

  const policies = [
    headers.get("content-security-policy"),
    headers.get("content-security-policy-report-only"),
  ].filter((value): value is string => Boolean(value))

  for (const policy of policies) {
    const ancestors = parseFrameAncestors(policy)
    if (!ancestors) continue
    if (!frameAncestorsAllowsEmbed(ancestors, embedderOrigin)) {
      return { embedAllowed: false, reason: "csp: frame-ancestors" }
    }
  }

  return { embedAllowed: true }
}

async function fetchHeaders(url: string): Promise<Headers | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "text/html" },
    })

    if (head.ok || head.status < 500) {
      return head.headers
    }
  } catch {
    // fall through to GET
  } finally {
    clearTimeout(timeout)
  }

  const getController = new AbortController()
  const getTimeout = setTimeout(() => getController.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: getController.signal,
      headers: { Accept: "text/html" },
    })

    if (!response.ok && response.status >= 500) return null
    return response.headers
  } catch {
    return null
  } finally {
    clearTimeout(getTimeout)
  }
}

/**
 * Server-side check whether `url` can be embedded in an iframe on this portfolio.
 * Results are cached in-memory for the lifetime of the server process.
 */
export async function checkEmbeddability(
  url: string,
  embedderOrigin = getSiteUrl().origin
): Promise<EmbeddabilityResult> {
  const cacheKey = `${url}::${embedderOrigin}`
  const cached = embeddabilityCache.get(cacheKey)
  if (cached) return cached

  let result: EmbeddabilityResult

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      result = { embedAllowed: false, reason: "invalid-protocol" }
    } else {
      const headers = await fetchHeaders(parsed.toString())
      result = headers
        ? evaluateHeaders(headers, embedderOrigin)
        : { embedAllowed: false, reason: "fetch-failed" }
    }
  } catch {
    result = { embedAllowed: false, reason: "invalid-url" }
  }

  embeddabilityCache.set(cacheKey, result)
  return result
}

/**
 * Resolve whether the client should mount a live iframe on desktop.
 * `image` — skip; `iframe` — trust config; `auto` — server header check.
 */
export async function resolveEmbedAllowed(
  url: string,
  previewType: ProjectPreviewType
): Promise<boolean> {
  if (previewType === "image") return false
  if (previewType === "iframe") return true

  const { embedAllowed } = await checkEmbeddability(url)
  return embedAllowed
}
