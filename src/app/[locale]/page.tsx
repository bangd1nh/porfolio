import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"

import { DotSpotlightBackground } from "@/components/atoms/dot-spotlight-background"
import { JsonLd } from "@/components/atoms/json-ld"
import { PageGrid } from "@/components/atoms/page-grid"
import { ContactCtaSection } from "@/components/organisms/contact-cta-section"
import { FeaturedStackSection } from "@/components/organisms/featured-stack-section"
import { HeroSection } from "@/components/organisms/hero-section"
import { ProfileDetailSection } from "@/components/organisms/profile-detail-section"
import { ProjectsSection } from "@/components/organisms/projects-section"
import { SectionPager } from "@/components/organisms/section-pager"
import { SiteDock } from "@/components/organisms/site-dock"
import { routing, type Locale } from "@/i18n/routing"
import { buildPageMetadata, getHomeJsonLd } from "@/lib/seo"

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params

  if (!hasLocale(routing.locales, localeParam)) {
    return {}
  }

  const locale = localeParam as Locale
  const t = await getTranslations({ locale, namespace: "metadata" })

  return buildPageMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
    isAbsoluteTitle: true,
  })
}

export default async function HomePage({ params }: PageProps) {
  const { locale: localeParam } = await params

  if (!hasLocale(routing.locales, localeParam)) {
    notFound()
  }

  const locale = localeParam as Locale
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "metadata" })

  return (
    <div className="relative min-h-full">
      <JsonLd data={getHomeJsonLd(locale, t("ogSiteName"))} />
      <DotSpotlightBackground />
      <SiteDock />
      <PageGrid className="relative z-10">
        <main className="contents">
          <SectionPager>
            <HeroSection />
            <ProfileDetailSection />
            <ProjectsSection />
            <FeaturedStackSection />
            <ContactCtaSection />
          </SectionPager>
        </main>
      </PageGrid>
    </div>
  )
}
