"use client"

import { Icon } from "@/components/atoms/icon"
import { GlassButton } from "@/components/atoms/glass-button"
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/atoms/glass-card"
import { GlassPanel } from "@/components/atoms/glass-panel"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowRight,
  Code2,
  GitBranch,
  Globe,
  Info,
  Layers,
  Mail,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react"
import { useTranslations } from "next-intl"

const TOOLKIT_ICONS = [
  { icon: Sparkles, labelKey: "icons.sparkles" },
  { icon: Zap, labelKey: "icons.zap" },
  { icon: Layers, labelKey: "icons.layers" },
  { icon: Code2, labelKey: "icons.code" },
  { icon: GitBranch, labelKey: "icons.github" },
  { icon: Globe, labelKey: "icons.globe" },
  { icon: Mail, labelKey: "icons.mail" },
  { icon: Sun, labelKey: "icons.sun" },
  { icon: Moon, labelKey: "icons.moon" },
  { icon: ArrowRight, labelKey: "icons.arrow" },
] as const

function ToolkitGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <GlassPanel
      variant="lg"
      className="col-span-10 grid grid-cols-10 gap-x-[inherit] gap-y-6 rounded-none p-6 md:p-8"
    >
      <div className="col-span-10 grid gap-2">
        <h3 className="font-heading text-xl tracking-tight md:text-2xl">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
      <div className="col-span-10 grid grid-cols-10 gap-x-[inherit] gap-y-4">
        {children}
      </div>
    </GlassPanel>
  )
}

export function UiToolkitSection() {
  const t = useTranslations("uiToolkit")

  return (
    <section
      id="ui-toolkit"
      className="page-section page-section-screen gap-y-8 border-t border-border py-24 md:gap-y-10"
    >
      <header className="col-span-10 grid grid-cols-10 gap-x-[inherit] gap-y-3">
        <span className="col-span-10 justify-self-start rounded-none border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
          {t("badge")}
        </span>
        <h2 className="font-heading col-span-10 text-3xl tracking-tight md:col-span-10 md:text-4xl">
          {t("title")}
        </h2>
        <p className="col-span-10 text-base text-muted-foreground md:col-span-7 md:text-lg">
          {t("description")}
        </p>
      </header>

      <ToolkitGroup title={t("icons.title")} description={t("icons.description")}>
        {TOOLKIT_ICONS.map(({ icon, labelKey }) => (
          <div
            key={labelKey}
            className="col-span-5 grid justify-items-center gap-2 rounded-none border border-border bg-card px-2 py-4 sm:col-span-2 md:col-span-1"
          >
            <Icon icon={icon} className="size-5 text-foreground" />
            <span className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
              {t(labelKey)}
            </span>
          </div>
        ))}
      </ToolkitGroup>

      <ToolkitGroup title={t("buttons.title")} description={t("buttons.description")}>
        <div className="col-span-10 grid grid-flow-col grid-cols-none auto-cols-max items-center justify-start gap-3 overflow-x-auto">
          <GlassButton variant="default">{t("buttons.default")}</GlassButton>
          <GlassButton variant="primary">{t("buttons.primary")}</GlassButton>
          <GlassButton variant="outline">{t("buttons.outline")}</GlassButton>
          <GlassButton variant="ghost">{t("buttons.ghost")}</GlassButton>
          <GlassButton variant="destructive">
            {t("buttons.destructive")}
          </GlassButton>
        </div>

        <div className="col-span-10 grid grid-flow-col grid-cols-none auto-cols-max items-center justify-start gap-3 overflow-x-auto border-t border-border pt-6">
          <GlassButton size="sm">{t("buttons.small")}</GlassButton>
          <GlassButton size="default">{t("buttons.medium")}</GlassButton>
          <GlassButton size="lg">{t("buttons.large")}</GlassButton>
          <GlassButton size="icon" aria-label={t("buttons.icon")}>
            <Sparkles />
          </GlassButton>
          <GlassButton variant="primary" size="icon-sm" aria-label={t("buttons.icon")}>
            <Zap />
          </GlassButton>
          <GlassButton variant="outline" size="icon-lg" aria-label={t("buttons.icon")}>
            <Layers />
          </GlassButton>
        </div>
      </ToolkitGroup>

      <ToolkitGroup
        title={t("tooltips.title")}
        description={t("tooltips.description")}
      >
        <div className="col-span-10 flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="outline" className="rounded-none" />}
            >
              {t("tooltips.basicTrigger")}
            </TooltipTrigger>
            <TooltipContent>{t("tooltips.basicContent")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none"
                  aria-label={t("tooltips.iconTrigger")}
                />
              }
            >
              <Info className="size-4" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>{t("tooltips.iconContent")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={<Button className="rounded-none" />}>
              {t("tooltips.primaryTrigger")}
            </TooltipTrigger>
            <TooltipContent>{t("tooltips.primaryContent")}</TooltipContent>
          </Tooltip>
        </div>

        <div className="col-span-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {(
            [
              ["top", "sideTop"],
              ["right", "sideRight"],
              ["bottom", "sideBottom"],
              ["left", "sideLeft"],
            ] as const
          ).map(([side, labelKey]) => (
            <Tooltip key={side}>
              <TooltipTrigger
                render={
                  <Button variant="outline" size="sm" className="rounded-none" />
                }
              >
                {t(`tooltips.${labelKey}`)}
              </TooltipTrigger>
              <TooltipContent side={side}>
                {t("tooltips.sideHint", { side })}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ToolkitGroup>

      <ToolkitGroup title={t("cards.title")} description={t("cards.description")}>
        <GlassCard variant="sm" className="col-span-10 md:col-span-3">
          <GlassCardHeader>
            <GlassCardTitle>{t("cards.basic.title")}</GlassCardTitle>
            <GlassCardDescription>
              {t("cards.basic.description")}
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="glass-inset rounded-none px-4 py-3 text-sm text-foreground">
              {t("cards.basic.content")}
            </div>
          </GlassCardContent>
        </GlassCard>

        <GlassCard variant="default" className="col-span-10 md:col-span-4">
          <GlassCardHeader>
            <div className="grid grid-cols-[auto_1fr] items-center gap-2">
              <span className="grid size-8 place-items-center rounded-none border border-border bg-card">
                <Icon icon={Sparkles} className="text-primary" />
              </span>
              <GlassCardTitle>{t("cards.featured.title")}</GlassCardTitle>
            </div>
            <GlassCardDescription>
              {t("cards.featured.description")}
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardFooter>
            <GlassButton variant="primary" size="sm">
              {t("cards.featured.action")}
              <ArrowRight />
            </GlassButton>
          </GlassCardFooter>
        </GlassCard>

        <GlassCard variant="lg" className="col-span-10 md:col-span-3">
          <GlassCardHeader>
            <GlassCardTitle>{t("cards.highlight.title")}</GlassCardTitle>
            <GlassCardDescription>
              {t("cards.highlight.description")}
            </GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-3 gap-2">
              {[
                t("cards.highlight.stat1"),
                t("cards.highlight.stat2"),
                t("cards.highlight.stat3"),
              ].map((stat) => (
                <div
                  key={stat}
                  className="glass-inset rounded-none px-2 py-4 text-center text-xs font-medium text-foreground"
                >
                  {stat}
                </div>
              ))}
            </div>
          </GlassCardContent>
          <GlassCardFooter className="grid grid-cols-2 gap-2">
            <GlassButton variant="outline" size="sm">
              {t("cards.highlight.secondary")}
            </GlassButton>
            <GlassButton variant="default" size="sm">
              {t("cards.highlight.primary")}
            </GlassButton>
          </GlassCardFooter>
        </GlassCard>
      </ToolkitGroup>
    </section>
  )
}
