import type { Metadata } from "next"

import { contactLinks } from "@/data/contact"
import { profileContent } from "@/data/profile"
import type { SiteRoutePath } from "@/data/site"
import { getPathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { getSiteUrl } from "@/lib/site-url"

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const PERSON_FRAGMENT = "#person"

type PageMetadataInput = {
  locale: Locale
  path: SiteRoutePath
  title: string
  description: string
  isAbsoluteTitle?: boolean
}

type JsonLdNode = Record<string, unknown>

export function getLocalizedPath(locale: Locale, href: SiteRoutePath): string {
  return getPathname({ locale, href })
}

export function getLanguageAlternates(
  href: SiteRoutePath
): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, getLocalizedPath(locale, href)])
  )
  languages["x-default"] = getLocalizedPath(routing.defaultLocale, href)
  return languages
}

export function getAbsoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString()
}

export function getOpenGraphLocale(locale: Locale): "vi_VN" | "en_US" {
  return locale === "vi" ? "vi_VN" : "en_US"
}

export function getAlternateOpenGraphLocale(locale: Locale): "vi_VN" | "en_US" {
  return locale === "vi" ? "en_US" : "vi_VN"
}

export function getOgImageUrl(
  locale: Locale,
  extras?: { title: string; description: string }
): URL {
  const ogImageUrl = new URL("/api/og", getSiteUrl())
  ogImageUrl.searchParams.set("locale", locale)

  if (extras) {
    ogImageUrl.searchParams.set("title", extras.title)
    ogImageUrl.searchParams.set("description", extras.description)
  }

  return ogImageUrl
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  isAbsoluteTitle = false,
}: PageMetadataInput): Metadata {
  const pagePath = getLocalizedPath(locale, path)
  const ogImageUrl = getOgImageUrl(locale, { title, description })

  return {
    title: isAbsoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: pagePath,
      languages: getLanguageAlternates(path),
    },
    openGraph: {
      type: path === "/cv" ? "profile" : "website",
      url: pagePath,
      locale: getOpenGraphLocale(locale),
      alternateLocale: [getAlternateOpenGraphLocale(locale)],
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

function toE164Vietnam(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("84")) return `+${digits}`
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`
  return `+84${digits}`
}

function getPersonNode(locale: Locale): JsonLdNode {
  const siteUrl = getSiteUrl()
  const homeUrl = getAbsoluteUrl(getLocalizedPath(locale, "/"))
  const skills = profileContent.skills.flatMap((group) => [...group.items])

  return {
    "@type": "Person",
    "@id": new URL(PERSON_FRAGMENT, siteUrl).toString(),
    name: profileContent.name[locale],
    url: homeUrl,
    image: `${contactLinks.github}.png`,
    jobTitle: profileContent.role[locale],
    email: `mailto:${contactLinks.email}`,
    telephone: toE164Vietnam(contactLinks.phone),
    address: {
      "@type": "PostalAddress",
      addressLocality: profileContent.location[locale],
      addressCountry: "VN",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name:
        locale === "vi"
          ? "Đại học FPT Đà Nẵng"
          : "FPT University Da Nang",
    },
    sameAs: [contactLinks.github],
    knowsAbout: skills,
    knowsLanguage: ["Vietnamese", "English"],
  }
}

function getWebsiteNode(locale: Locale, siteName: string): JsonLdNode {
  const siteUrl = getSiteUrl()
  const homeUrl = getAbsoluteUrl(getLocalizedPath(locale, "/"))

  return {
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    name: siteName,
    url: homeUrl,
    inLanguage: [...routing.locales],
    publisher: {
      "@id": new URL(PERSON_FRAGMENT, siteUrl).toString(),
    },
  }
}

export function getHomeJsonLd(locale: Locale, siteName: string): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [getPersonNode(locale), getWebsiteNode(locale, siteName)],
  }
}

export function getCvJsonLd(
  locale: Locale,
  labels: { home: string; cv: string }
): JsonLdNode {
  const siteUrl = getSiteUrl()
  const homeUrl = getAbsoluteUrl(getLocalizedPath(locale, "/"))
  const cvUrl = getAbsoluteUrl(getLocalizedPath(locale, "/cv"))

  return {
    "@context": "https://schema.org",
    "@graph": [
      getPersonNode(locale),
      {
        "@type": "ProfilePage",
        "@id": `${cvUrl}#page`,
        url: cvUrl,
        name: labels.cv,
        inLanguage: locale,
        isPartOf: {
          "@id": `${homeUrl}#website`,
        },
        mainEntity: {
          "@id": new URL(PERSON_FRAGMENT, siteUrl).toString(),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: labels.home,
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: labels.cv,
            item: cvUrl,
          },
        ],
      },
    ],
  }
}
