"use client"

import {
  ArrowUpRight,
  Check,
  Copy,
  FileDown,
  GitBranch,
  Mail,
  Phone,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { SplitWords } from "@/components/atoms/split-words"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { buildBlocks, type BuildBlockLabelKey } from "@/data/build-blocks"
import { contactLinks } from "@/data/contact"
import { projectsContent } from "@/data/projects"
import { resumeLinks } from "@/data/resume"
import { HOME_SECTIONS } from "@/data/site"
import { cn } from "@/lib/utils"

const INTENTS = ["fulltime", "freelance", "collab"] as const
type Intent = (typeof INTENTS)[number]

const MAX_RELATED = 3

const pad = (value: number) => String(value).padStart(2, "0")

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Ho_Chi_Minh",
})

function subscribeClock(onChange: () => void) {
  const id = window.setInterval(onChange, 1000)
  return () => window.clearInterval(id)
}

/** Live wall-clock in Da Nang; SSR renders a placeholder. */
function useDaNangTime() {
  return useSyncExternalStore(
    subscribeClock,
    () => timeFormatter.format(new Date()),
    () => "--:--:--"
  )
}

/**
 * Contact screen — a brief composer. Visitors pick what they need and the
 * email drafts itself in a live preview, ready to send or copy.
 */
export function ContactInteraction() {
  const t = useTranslations("contact")
  const blockT = useTranslations("contact.blocks")
  const projectT = useTranslations("projects")
  const time = useDaNangTime()
  const [intent, setIntent] = useState<Intent>("fulltime")
  const [caps, setCaps] = useState<BuildBlockLabelKey[]>([])
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    },
    []
  )

  const selectedBlocks = buildBlocks.filter((block) => caps.includes(block.labelKey))
  const intentLabel = t(`intents.${intent}`)
  const capList = selectedBlocks.map((block) => blockT(block.labelKey)).join(", ")

  const related = [...new Set(selectedBlocks.flatMap((block) => block.projectIds))]
    .slice(0, MAX_RELATED)
    .map((id) => projectsContent.find((project) => project.id === id))
    .filter((project) => project !== undefined)

  const subject = `[Portfolio] ${intentLabel}${capList ? ` — ${capList}` : ""}`
  const body = [
    t("greeting"),
    "",
    t(`bodyIntent.${intent}`),
    ...(capList ? [t("bodyCaps", { list: capList })] : []),
    t("bodyClose"),
    "",
    t("signoff"),
    t("signName"),
  ].join("\n")
  const mailto = `mailto:${contactLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const toggleCap = (key: BuildBlockLabelKey) =>
    setCaps((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    )

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactLinks.email)
      setCopied(true)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${contactLinks.email}`
    }
  }


  const channels = [
    {
      key: "email",
      label: t("email"),
      value: contactLinks.email,
      href: `mailto:${contactLinks.email}`,
      icon: Mail,
      external: false,
    },
    {
      key: "phone",
      label: t("phone"),
      value: contactLinks.phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3"),
      href: `tel:${contactLinks.phone}`,
      icon: Phone,
      external: false,
    },
    {
      key: "github",
      label: t("github"),
      value: `@${contactLinks.github.split("/").pop()}`,
      href: contactLinks.github,
      icon: GitBranch,
      external: true,
    },
  ]

  return (
    <div className="col-span-10 grid min-h-0 gap-y-8 lg:h-full lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-y-5 short:gap-y-3">
      {/* ——— Header ——— */}
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid min-w-0 gap-3 short:gap-2">
          <div data-reveal="up" className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-bold text-primary">
              {pad(HOME_SECTIONS.length)}
            </span>
            <span data-reveal="draw" className="h-px w-10 bg-foreground/50" aria-hidden />
            <p className="system-label text-foreground">{t("badge")}</p>
          </div>
          <h2
            data-reveal="title"
            className="font-heading text-[clamp(2.5rem,min(7.5vw,13svh),9rem)] leading-[0.95] font-bold tracking-[-0.05em] text-balance short:text-[clamp(2.5rem,min(6vw,9svh),5rem)]"
          >
            <SplitWords text={t("title")} />
          </h2>
          <p
            data-reveal="up"
            className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base short:hidden"
          >
            {t("description")}
          </p>
        </div>

        <aside
          data-reveal="up"
          className="grid w-full grid-cols-2 border-3 border-border-brutal bg-card shadow-brutal lg:w-[22rem]"
        >
          <p className="col-span-2 flex items-center gap-2 border-b-2 border-border-brutal bg-primary px-4 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-primary-foreground uppercase">
            <span className="pulse-dot size-1.5 bg-primary-foreground" aria-hidden />
            {t("status")}
          </p>
          <div className="grid gap-1 px-4 py-3 short:py-2">
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              {t("localTime")}
            </p>
            <p className="font-mono text-xl font-bold tracking-tight tabular-nums">
              <time suppressHydrationWarning>{time}</time>
            </p>
          </div>
          <div className="grid gap-1 border-l-2 border-border-brutal px-4 py-3 short:py-2">
            <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              {t("timeZone")}
            </p>
            <p className="font-mono text-xl font-bold tracking-tight">GMT+7</p>
          </div>
        </aside>
      </header>

      {/* ——— Composer + live preview ——— */}
      <div className="grid min-h-0 gap-6 lg:grid-cols-10 lg:items-center lg:gap-x-[var(--page-col-gap)]">
        <div data-reveal="up" className="grid min-h-0 content-start gap-5 lg:col-span-5 short:gap-3">
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            <span className="size-1.5 rotate-45 bg-primary" aria-hidden />
            {t("composerHint")}
          </p>

          <div className="grid gap-2.5 short:gap-2">
            <p id="composer-intent" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight short:text-base">
              <span className="font-mono text-[10px] font-bold text-primary">01</span>
              {t("stepIntent")}
            </p>
            <div role="radiogroup" aria-labelledby="composer-intent" className="grid grid-cols-3 gap-2">
              {INTENTS.map((item) => {
                const selected = item === intent
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-selected={selected}
                    onClick={() => setIntent(item)}
                    className="composer-option min-h-11 truncate border-2 border-border-brutal px-3 py-2.5 text-sm font-semibold short:min-h-9 short:py-1.5"
                  >
                    {t(`intents.${item}`)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2.5 short:gap-2">
            <p className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight short:text-base">
              <span className="font-mono text-[10px] font-bold text-primary">02</span>
              {t("stepCaps")}
              {caps.length > 0 ? (
                <span className="font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                  ({pad(caps.length)})
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {buildBlocks.map((block) => {
                const selected = caps.includes(block.labelKey)
                return (
                  <button
                    key={block.id}
                    type="button"
                    aria-pressed={selected}
                    data-selected={selected}
                    onClick={() => toggleCap(block.labelKey)}
                    className="composer-chip inline-flex min-h-10 items-center gap-2 border-2 border-border-brutal px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.08em] uppercase short:min-h-8 short:py-1"
                  >
                    <span
                      className="composer-chip-box grid size-3.5 place-items-center border border-current"
                      aria-hidden
                    >
                      <Check className="size-2.5" />
                    </span>
                    {blockT(block.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2.5 short:gap-2" aria-live="polite">
            <p
              className={cn(
                "flex items-center gap-2 font-heading text-lg font-semibold tracking-tight transition-opacity duration-300 short:text-base",
                related.length === 0 && "opacity-40"
              )}
            >
              <span className="font-mono text-[10px] font-bold text-primary">03</span>
              {t("relatedWork")}
            </p>
            <div className="flex min-h-12 flex-wrap gap-2">
              {related.length === 0 ? (
                  <span
                    key="empty"
                    className="grid min-h-12 flex-1 place-items-center border-2 border-dashed border-foreground/20 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    ↑ {t("stepCaps")}
                  </span>
                ) : (
                  related.map((project) => {
                    const title = projectT(`items.${project.id}.title`)
                    return (
                      <span
                        key={project.id}
                        className="motion-enter flex min-w-0 flex-1 basis-40"
                        style={{ "--enter-y": "10px" } as React.CSSProperties}
                      >
                        <TransitionLink
                          href={`/projects/${project.id}`}
                          prefetch={false}
                          aria-label={t("openProject", { project: title })}
                          className="group grid min-h-12 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-2 border-border-brutal bg-card px-3 py-2 shadow-brutal-sm transition-[transform,box-shadow,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-brutal motion-reduce:transition-none"
                        >
                          <span className="grid min-w-0 gap-0.5">
                            <span className="truncate font-heading text-sm font-semibold tracking-tight">
                              {title}
                            </span>
                            <span className="truncate font-mono text-[9px] tracking-[0.1em] text-muted-foreground uppercase group-hover:text-primary-foreground/70">
                              {projectT(`items.${project.id}.descriptor`)}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden
                          />
                        </TransitionLink>
                      </span>
                    )
                  })
                )}
            </div>
          </div>
        </div>

        <article
          data-reveal="up"
          data-reveal-delay="0.1"
          aria-label={t("newMessage")}
          className="grid max-h-full min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] border-3 border-border-brutal bg-card shadow-brutal lg:col-span-5"
        >
          <header className="flex items-center gap-3 border-b-2 border-border-brutal px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 bg-primary" />
              <span className="size-2.5 border border-foreground/40" />
              <span className="size-2.5 border border-foreground/40" />
            </span>
            <p className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase">
              {t("newMessage")}
            </p>
          </header>
          <p className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 border-b border-border px-4 py-2.5 text-sm short:py-2">
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {t("to")}
            </span>
            <span className="truncate font-semibold">{contactLinks.email}</span>
          </p>
          <p className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 border-b border-border px-4 py-2.5 text-sm short:py-2">
            <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {t("subject")}
            </span>
            <span key={subject} className="motion-flash truncate font-semibold">
              {subject}
            </span>
          </p>
          <div className="min-h-0 overflow-y-auto px-4 py-4 text-sm leading-relaxed [scrollbar-width:thin] sm:text-base short:py-3 short:text-sm">
            <p>{t("greeting")}</p>
            <p className="mt-3">
              <span key={intent} className="motion-flash">
                {t(`bodyIntent.${intent}`)}
              </span>
              {capList ? (
                <>
                  {" "}
                  <span key={capList} className="motion-flash font-semibold">
                    {t("bodyCaps", { list: capList })}
                  </span>
                </>
              ) : null}
            </p>
            <p className="mt-3">{t("bodyClose")}</p>
            <p className="mt-3 text-muted-foreground">
              {t("signoff")}
              <br />
              {t("signName")}
              <span className="terminal-caret" aria-hidden />
            </p>
          </div>
          <footer className="flex flex-wrap gap-2 border-t-2 border-border-brutal px-4 py-3">
            <span data-magnetic="0.2" className="inline-flex flex-1">
              <Button
                className="group min-h-11 w-full rounded-none"
                nativeButton={false}
                render={<a href={mailto} />}
              >
                <Mail data-icon="inline-start" aria-hidden />
                {t("send")}
                <ArrowUpRight
                  data-icon="inline-end"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Button>
            </span>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-none"
              onClick={copyEmail}
            >
              {copied ? (
                <Check data-icon="inline-start" aria-hidden />
              ) : (
                <Copy data-icon="inline-start" aria-hidden />
              )}
              <span aria-live="polite">{copied ? t("copied") : t("copyEmail")}</span>
            </Button>
          </footer>
        </article>
      </div>

      {/* ——— Channels ——— */}
      <ul
        data-reveal-group
        className="grid grid-cols-1 border-2 border-border-brutal sm:grid-cols-2 lg:grid-cols-4"
      >
        {channels.map((channel) => {
          const Icon = channel.icon
          return (
            <li key={channel.key} className="contact-channel-cell">
              <a
                href={channel.href}
                {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="contact-channel group/channel"
              >
                <ChannelContent
                  icon={<Icon className="size-4" aria-hidden />}
                  label={channel.label}
                  value={channel.value}
                />
              </a>
            </li>
          )
        })}
        <li className="contact-channel-cell">
          <TransitionLink href={resumeLinks.pagePath} className="contact-channel group/channel">
            <ChannelContent
              icon={<FileDown className="size-4" aria-hidden />}
              label={t("resume")}
              value={t("viewResume")}
            />
          </TransitionLink>
        </li>
      </ul>
    </div>
  )
}

function ChannelContent({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <>
      <span className="relative z-1 grid min-w-0 gap-1">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase transition-colors group-hover/channel:text-primary-foreground/70">
          {icon}
          {label}
        </span>
        <span className="truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
          {value}
        </span>
      </span>
      <ArrowUpRight
        className="relative z-1 size-5 shrink-0 transition-transform duration-300 group-hover/channel:translate-x-0.5 group-hover/channel:-translate-y-0.5 group-hover/channel:rotate-45"
        aria-hidden
      />
    </>
  )
}
