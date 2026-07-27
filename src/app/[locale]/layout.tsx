import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ThemeTransition } from "@/components/providers/theme-transition"
import { TooltipProvider } from "@/components/ui/tooltip"
import { routing, type Locale } from "@/i18n/routing"
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

  return {
    title: t("title"),
    description: t("description"),
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
        playfairDisplayHeading.variable
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
                {children}
              </NextIntlClientProvider>
            </TooltipProvider>
          </ThemeTransition>
        </ThemeProvider>
      </body>
    </html>
  )
}
