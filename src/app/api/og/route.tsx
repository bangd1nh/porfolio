import { ImageResponse } from "next/og"

import { profileContent } from "@/data/profile"
import { projectsContent, type ProjectId } from "@/data/projects"
import en from "@/messages/en.json"
import vi from "@/messages/vi.json"

export const runtime = "edge"

const OG_WIDTH = 1200
const OG_HEIGHT = 630

/** Mirrors the site's dark neo-brutal palette. */
const C = {
  bg: "#121212",
  ink: "#faf8f0",
  muted: "#9d998f",
  line: "rgba(250, 248, 240, 0.18)",
  yellow: "#f2c200",
  black: "#000000",
  white: "#ffffff",
}

const HEADING = "Lexend"
const MONO = "Roboto Mono"
const PHOTO_PATH = "/profile/bang.jpg"
const BARCODE = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 1, 4, 2, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1]

type Locale = "en" | "vi"
type FontSpec = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700 | 800; style: "normal" }

function limit(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…` : value
}

const pad = (value: number) => String(value).padStart(2, "0")

/**
 * Fetches a Google font subset containing only `text`. Without a browser UA
 * Google serves TTF, which Satori can read. Returns [] on failure so the image
 * still renders with the default font.
 */
async function loadGoogleFont(
  family: string,
  weights: readonly FontSpec["weight"][],
  text: string,
): Promise<FontSpec[]> {
  try {
    const query = `family=${family.replace(/ /g, "+")}:wght@${weights.join(";")}&text=${encodeURIComponent(text)}`
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`)).text()
    const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?src:\s*url\((.+?)\)/g)]
    return await Promise.all(
      faces.map(async ([, weight, url]) => ({
        name: family,
        data: await (await fetch(url!)).arrayBuffer(),
        weight: Number(weight) as FontSpec["weight"],
        style: "normal" as const,
      })),
    )
  } catch {
    return []
  }
}

/* ——— Shared pieces ——— */

function Frame({
  main,
  aside,
  mainWidth,
  left,
  right,
  footerLeft,
  footerRight,
}: {
  main: React.ReactNode
  aside: React.ReactNode
  /** Satori needs explicit widths — flex-grow alone collapses text columns. */
  mainWidth: number
  left: string
  right: string
  footerLeft: string
  footerRight: string
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: C.bg,
        color: C.ink,
        fontFamily: HEADING,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "radial-gradient(circle, rgba(250, 248, 240, 0.13) 1.4px, transparent 1.6px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "44px 56px 36px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: C.muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, display: "flex", background: C.yellow }} />
            <span style={{ color: C.ink }}>{left}</span>
          </div>
          <span>{right}</span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: mainWidth, display: "flex", flexDirection: "column" }}>{main}</div>
          {aside}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: `2px solid ${C.line}`,
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: C.muted,
          }}
        >
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      </div>
    </div>
  )
}

function MonoLabel({ children, color = C.yellow }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: MONO,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: "0.16em",
        color,
      }}
    >
      {children}
    </div>
  )
}

/** Headline as wrapping words; the accent phrase gets the hero's yellow block. */
function Headline({ text, accent, size }: { text: string; accent?: string; size: number }) {
  const at = accent ? text.indexOf(accent) : -1
  const before = at >= 0 ? text.slice(0, at) : text
  const after = at >= 0 && accent ? text.slice(at + accent.length) : ""
  const words = (value: string) => value.split(/\s+/).filter(Boolean)

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        columnGap: size * 0.26,
        rowGap: size * 0.06,
        fontSize: size,
        lineHeight: 1.04,
        fontWeight: 800,
        letterSpacing: "-0.045em",
      }}
    >
      {words(before).map((word, index) => (
        <span key={`b-${index}`}>{word}</span>
      ))}
      {at >= 0 && accent ? (
        <span
          style={{
            display: "flex",
            background: C.yellow,
            color: C.black,
            padding: `0 ${size * 0.1}px`,
            boxShadow: `6px 6px 0 ${C.black}`,
          }}
        >
          {accent}
        </span>
      ) : null}
      {words(after).map((word, index) =>
        // Keep trailing punctuation glued to the accent block.
        index === 0 && /^[.,!?]/.test(word) ? (
          <span key={`a-${index}`} style={{ marginLeft: -size * 0.24 }}>
            {word}
          </span>
        ) : (
          <span key={`a-${index}`}>{word}</span>
        ),
      )}
    </div>
  )
}

function IdCard({
  photo,
  name,
  role,
  label,
  status,
  facts,
}: {
  photo: string
  name: string
  role: string
  label: string
  status: string
  facts: readonly { label: string; value: string }[]
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div
        style={{
          width: 26,
          height: 46,
          display: "flex",
          background: C.yellow,
          border: `3px solid ${C.black}`,
        }}
      />
      <div
        style={{
          width: 340,
          display: "flex",
          flexDirection: "column",
          marginTop: -6,
          background: C.white,
          color: C.black,
          border: `4px solid ${C.black}`,
          boxShadow: `12px 12px 0 ${C.yellow}`,
          transform: "rotate(-3deg)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: C.yellow,
            padding: "10px 16px",
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.16em",
          }}
        >
          <span>{label.toUpperCase()}</span>
          <div
            style={{ width: 44, height: 8, display: "flex", borderRadius: 8, background: C.black }}
          />
          <span>DEV-012003</span>
        </div>

        <div style={{ display: "flex", gap: 16, padding: "18px 18px 14px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
          <img
            src={photo}
            width={118}
            height={148}
            alt=""
            style={{
              objectFit: "cover",
              border: `3px solid ${C.black}`,
              boxShadow: `5px 5px 0 ${C.yellow}`,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                lineHeight: 1.08,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: MONO,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#555",
              }}
            >
              {role.toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  display: "flex",
                  background: C.yellow,
                  border: `1px solid ${C.black}`,
                }}
              />
              {status.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", margin: "0 18px", border: `3px solid ${C.black}` }}>
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "8px 12px",
                borderLeft: index > 0 ? `3px solid ${C.black}` : "none",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#666",
                }}
              >
                {fact.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{fact.value}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "14px 18px 16px",
          }}
        >
          <div style={{ display: "flex", height: 30, gap: 2 }}>
            {BARCODE.map((bar, index) => (
              <div
                key={index}
                style={{
                  width: bar,
                  height: "100%",
                  display: "flex",
                  background: index % 2 === 0 ? C.black : "transparent",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#666",
            }}
          >
            {role.split(" ")[0]?.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}

function ProjectStage({ logo, host, index }: { logo: string; host: string; index: number }) {
  return (
    <div
      style={{
        width: 420,
        height: 380,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        border: `4px solid ${C.black}`,
        boxShadow: `12px 12px 0 ${C.yellow}`,
        outline: `2px solid ${C.line}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: `3px solid ${C.black}`,
          background: "#1b1b1b",
        }}
      >
        <div style={{ width: 11, height: 11, display: "flex", background: C.yellow }} />
        <div style={{ width: 11, height: 11, display: "flex", border: `1px solid ${C.muted}` }} />
        <div style={{ width: 11, height: 11, display: "flex", border: `1px solid ${C.muted}` }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            marginLeft: 8,
            padding: "5px 10px",
            border: `1px solid ${C.line}`,
            fontFamily: MONO,
            fontSize: 13,
            color: C.ink,
          }}
        >
          <span style={{ color: C.muted }}>https://</span>
          {host}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "radial-gradient(circle, rgba(250, 248, 240, 0.2) 1.4px, transparent 1.6px)",
          backgroundSize: "16px 16px",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 18,
            bottom: -36,
            fontSize: 190,
            fontWeight: 800,
            letterSpacing: "-0.06em",
            color: "rgba(250, 248, 240, 0.08)",
          }}
        >
          {pad(index)}
        </span>
        <div
          style={{
            display: "flex",
            padding: "22px 28px",
            background: C.white,
            border: `4px solid ${C.black}`,
            boxShadow: `8px 8px 0 ${C.yellow}`,
            transform: "rotate(-3deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
          <img src={logo} height={120} alt="" style={{ objectFit: "contain", maxWidth: 220 }} />
        </div>
      </div>
    </div>
  )
}

/* ——— Route ——— */

export async function GET(request: Request) {
  const url = new URL(request.url)
  const locale: Locale = url.searchParams.get("locale") === "vi" ? "vi" : "en"
  const messages = locale === "vi" ? vi : en
  const path = url.searchParams.get("path") ?? "/"
  const origin = url.origin
  const host = url.host.replace(/^www\./, "")
  const name = profileContent.name[locale]
  const projectId = path.startsWith("/projects/") ? (path.split("/")[2] as ProjectId) : null
  const project = projectId ? projectsContent.find((item) => item.id === projectId) : undefined

  const idCard = (
    <IdCard
      photo={`${origin}${PHOTO_PATH}`}
      name={name}
      role={profileContent.role[locale]}
      label={messages.profile.card.label}
      status={messages.profile.card.status}
      facts={[
        { label: messages.profile.fields.birth, value: profileContent.birth },
        { label: messages.profile.fields.location, value: profileContent.location[locale] },
      ]}
    />
  )

  let main: React.ReactNode
  let aside: React.ReactNode
  let mainWidth: number
  let chrome: { left: string; right: string; footerLeft: string }
  let text: string

  if (project) {
    const index = projectsContent.indexOf(project) + 1
    const item = messages.projects.items[project.id]
    const stack = project.stack.slice(0, 5)
    chrome = {
      left: `${messages.projects.caseStudyLabel.toUpperCase()} / ${pad(index)}`,
      right: item.descriptor.toUpperCase(),
      footerLeft: name.toUpperCase(),
    }
    text = [
      item.title,
      item.outcome,
      stack.join(""),
      chrome.left,
      chrome.right,
      chrome.footerLeft,
      host,
    ].join("")
    mainWidth = 580
    aside = (
      <ProjectStage
        logo={`${origin}${project.icon}`}
        host={project.liveUrl.replace(/^https?:\/\//, "")}
        index={index}
      />
    )
    main = (
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <MonoLabel>
          <div style={{ width: 36, height: 2, display: "flex", background: C.yellow }} />
          {project.period.toUpperCase()}
        </MonoLabel>
        <Headline text={limit(item.title, 48)} size={item.title.length > 24 ? 60 : 76} />
        <div
          style={{
            display: "flex",
            borderLeft: `6px solid ${C.yellow}`,
            paddingLeft: 20,
            fontSize: 28,
            lineHeight: 1.3,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          {limit(item.outcome, 90)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {stack.map((tech) => (
            <div
              key={tech}
              style={{
                display: "flex",
                padding: "6px 12px",
                border: `2px solid ${C.line}`,
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    )
  } else if (path === "/") {
    const hero = messages.hero
    chrome = {
      left: `${messages.site.name.toUpperCase()} / PORTFOLIO`,
      right: `01 / ${pad(5)}`,
      footerLeft: hero.technologies.toUpperCase(),
    }
    text = [
      hero.headline,
      hero.identityLabel,
      name,
      hero.availability,
      chrome.left,
      chrome.right,
      chrome.footerLeft,
      host,
    ].join("")
    mainWidth = 650
    aside = idCard
    main = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <MonoLabel>
          01 / {hero.identityLabel.toUpperCase()}
          <div style={{ width: 40, height: 2, display: "flex", background: C.muted }} />
          <span style={{ color: C.muted }}>{name.toUpperCase()}</span>
        </MonoLabel>
        <Headline
          text={hero.headline}
          accent={hero.headlineAccent}
          size={locale === "vi" ? 70 : 60}
        />
        <MonoLabel color={C.ink}>
          <div style={{ width: 12, height: 12, display: "flex", background: C.yellow }} />
          {hero.availability.toUpperCase()}
        </MonoLabel>
      </div>
    )
  } else {
    const title = limit(url.searchParams.get("title")?.trim() || messages.metadata.title, 60)
    const description = limit(
      url.searchParams.get("description")?.trim() || messages.metadata.description,
      140,
    )
    chrome = {
      left: `${messages.site.name.toUpperCase()} / ${path.replace(/^\//, "").toUpperCase() || "PORTFOLIO"}`,
      right: locale.toUpperCase(),
      footerLeft: messages.hero.technologies.toUpperCase(),
    }
    text = [
      title,
      description,
      chrome.left,
      chrome.right,
      chrome.footerLeft,
      host,
      messages.profile.card.label,
      messages.profile.card.status,
      messages.profile.fields.birth,
      messages.profile.fields.location,
      name,
      profileContent.role[locale],
      profileContent.location[locale],
    ].join("")
    mainWidth = 620
    aside = idCard
    main = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Headline text={title} size={title.length > 36 ? 56 : 68} />
        <div
          style={{
            display: "flex",
            maxWidth: 640,
            fontSize: 24,
            lineHeight: 1.45,
            color: C.muted,
            fontWeight: 600,
          }}
        >
          {description}
        </div>
      </div>
    )
  }

  // The ID card appears on home and generic pages; include its copy in the subset.
  const cardText = [
    messages.profile.card.label,
    messages.profile.card.status,
    messages.profile.fields.birth,
    messages.profile.fields.location,
    name,
    profileContent.role[locale],
    profileContent.location[locale],
    profileContent.birth,
    "DEV-012003",
  ].join("")
  const glyphs = [
    ...new Set(`${text}${cardText}0123456789/·—…:. `.toUpperCase() + `${text}${cardText}`),
  ].join("")

  const [heading, mono] = await Promise.all([
    loadGoogleFont(HEADING, [600, 800], glyphs),
    loadGoogleFont(MONO, [700], glyphs),
  ])

  return new ImageResponse(
    <Frame
      main={main}
      aside={aside}
      mainWidth={mainWidth}
      left={chrome.left}
      right={chrome.right}
      footerLeft={chrome.footerLeft}
      footerRight={host}
    />,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [...heading, ...mono],
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  )
}
