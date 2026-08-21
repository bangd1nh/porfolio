import type { MetadataRoute } from "next"

import { SITE_ROUTES } from "@/data/site"
import { routing } from "@/i18n/routing"
import {
  getAbsoluteUrl,
  getLanguageAlternates,
  getLocalizedPath,
} from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: getAbsoluteUrl(getLocalizedPath(locale, route.path)),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(getLanguageAlternates(route.path)).map(
            ([language, pathname]) => [language, getAbsoluteUrl(pathname)]
          )
        ),
      },
    }))
  )
}
