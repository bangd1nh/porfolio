import { ImageResponse } from "next/og"

export const runtime = "edge"

const OG_WIDTH = 1200
const OG_HEIGHT = 630

const copy = {
  en: {
    title: "Nguyen Dinh Bang | Portfolio",
    description: "Personal portfolio of Nguyen Dinh Bang — Fullstack Developer",
    eyebrow: "FULLSTACK DEVELOPER",
    availability: "AVAILABLE FOR PROJECTS",
    craft: "DESIGN · CODE · SHIP",
  },
  vi: {
    title: "Nguyễn Đình Bảng | Portfolio",
    description: "Portfolio cá nhân của Nguyễn Đình Bảng — Fullstack Developer",
    eyebrow: "FULLSTACK DEVELOPER",
    availability: "SẴN SÀNG CHO DỰ ÁN MỚI",
    craft: "THIẾT KẾ · CODE · SHIP",
  },
} as const

function limit(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, Math.max(0, maxLength - 1)).trim()}…`
    : value
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const locale = url.searchParams.get("locale") === "vi" ? "vi" : "en"
  const content = copy[locale]
  const title = limit(url.searchParams.get("title")?.trim() || content.title, 76)
  const description = limit(
    url.searchParams.get("description")?.trim() || content.description,
    150
  )
  const host = url.host.replace(/^www\./, "")

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#111315",
        color: "#f4f1e8",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "54px 60px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(244, 241, 232, 0.16) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 24,
          display: "flex",
          border: "1px solid rgba(244, 241, 232, 0.22)",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#c9c6bd",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.18em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 12,
                height: 12,
                display: "flex",
                background: "#ffd000",
              }}
            />
            PORTFOLIO / 2026
          </div>
          <span>{locale.toUpperCase()} / OG—1200×630</span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 50,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(244, 241, 232, 0.35)",
                background: "rgba(17, 19, 21, 0.84)",
                padding: "10px 16px",
                color: "#ffd000",
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: "0.16em",
              }}
            >
              {content.eyebrow}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                maxWidth: 750,
                fontSize: title.length > 48 ? 58 : 68,
                lineHeight: 1.03,
                fontWeight: 800,
                letterSpacing: "-0.045em",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                maxWidth: 700,
                color: "#c9c6bd",
                fontSize: 24,
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          </div>

          <div
            style={{
              width: 290,
              height: 350,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              flexShrink: 0,
              background: "#ffd000",
              color: "#111315",
              border: "2px solid #111315",
              boxShadow: "13px 13px 0 rgba(255, 208, 0, 0.2)",
              padding: "26px 28px",
              transform: "rotate(2deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: "0.12em",
              }}
            >
              <span>PROFILE</span>
              <span>01</span>
            </div>

            <div
              style={{
                width: "100%",
                height: 2,
                display: "flex",
                marginTop: 18,
                background: "rgba(17, 19, 21, 0.75)",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 28,
                fontSize: 42,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              <span>BUILD.</span>
              <span>POLISH.</span>
              <span>SHIP.</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: "auto",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.1em",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: "flex",
                  background: "#111315",
                }}
              />
              {content.availability}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid rgba(244, 241, 232, 0.25)",
            color: "#c9c6bd",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          <span>{content.craft}</span>
          <span>{host}</span>
        </div>
      </div>
    </div>,
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  )
}
