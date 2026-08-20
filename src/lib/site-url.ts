const PRODUCTION_SITE_URL = "https://ndbangdev.io.vn"

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

/** Absolute origin used by metadata and social crawlers. */
export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL?.trim()
  const candidate = configured || PRODUCTION_SITE_URL

  try {
    return new URL(withProtocol(candidate))
  } catch {
    return new URL(PRODUCTION_SITE_URL)
  }
}
