"use client"

import { useTranslations } from "next-intl"

type PortfolioBootLoaderProps = {
  phase: "boot" | "exit"
}

/** Branded boot sequence for the portfolio shell. */
export function PortfolioBootLoader({ phase }: PortfolioBootLoaderProps) {
  const t = useTranslations("loader")
  const steps = [t("steps.map"), t("steps.compile"), t("steps.ready")]

  return (
    <section
      className="portfolio-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={t("label")}
    >
      <div className="portfolio-loader-panel">
        <p className="portfolio-loader-eyebrow">{t("eyebrow")}</p>
        <div className="portfolio-loader-title-row">
          <h1 className="portfolio-loader-title">bang.dinh</h1>
          <span className="portfolio-loader-caret" aria-hidden />
        </div>

        <div className="portfolio-loader-progress" aria-hidden>
          <span />
        </div>

        <ol className="portfolio-loader-steps">
          {steps.map((step, index) => (
            <li
              key={step}
              style={{ "--loader-delay": index } as React.CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>

        <p className="portfolio-loader-signature">{t("signature")}</p>
      </div>
    </section>
  )
}
