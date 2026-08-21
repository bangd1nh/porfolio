import type { Metadata } from "next"
import {
  Caveat,
  Geist,
  Geist_Mono,
  Noto_Sans,
  Playfair_Display,
} from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { ThemeTransition } from "@/components/providers/theme-transition"
import { GlobalLoaderProvider } from "@/components/providers/global-loader"
import { TooltipProvider } from "@/components/ui/tooltip"
import { profileContent } from "@/data/profile"
import { routing, type Locale } from "@/i18n/routing"
import {
  getAlternateOpenGraphLocale,
  getOgImageUrl,
  getOpenGraphLocale,
} from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"
import { cn } from "@/lib/utils"
import "../globals.css"

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
})

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const caveatHandwriting = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
})

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!hasLocale(routing.locales, localeParam)) {
    return {}
  }

  const locale = localeParam as Locale
  const t = await getTranslations({ locale, namespace: "metadata" })
  const siteUrl = getSiteUrl()
  const ogImageUrl = getOgImageUrl(locale)
  const authorName = profileContent.name[locale]

  return {
    metadataBase: siteUrl,
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: authorName, url: siteUrl }],
    creator: authorName,
    publisher: authorName,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      siteName: t("ogSiteName"),
      locale: getOpenGraphLocale(locale),
      alternateLocale: [getAlternateOpenGraphLocale(locale)],
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: t("title"),
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImageUrl],
    },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable,
        caveatHandwriting.variable
      )}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeTransition>
            <TooltipProvider delay={200}>
              <NextIntlClientProvider messages={messages}>
                <GlobalLoaderProvider>{children}</GlobalLoaderProvider>
              </NextIntlClientProvider>
            </TooltipProvider>
          </ThemeTransition>
        </ThemeProvider>
      </body>
    </html>
  )
}
