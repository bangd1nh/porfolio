import type { MetadataRoute } from "next"

import { SITE_ROUTES } from "@/data/site"
import { routing } from "@/i18n/routing"
import { LLMS_FULL_TXT_PATH, LLMS_TXT_PATH } from "@/lib/llms-txt"
import { getAbsoluteUrl, getLocalizedPath } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    ...SITE_ROUTES.map((route) => ({
      url: getAbsoluteUrl(getLocalizedPath(routing.defaultLocale, route.path)),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    {
      url: getAbsoluteUrl(LLMS_TXT_PATH),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: getAbsoluteUrl(LLMS_FULL_TXT_PATH),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.3,
    },
  ]
}
