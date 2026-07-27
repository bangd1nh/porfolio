/** Resume / CV links — drop a PDF at `public/resume.pdf` to enable direct download. */
export const resumeLinks = {
  /** In-app printable CV route (locale-prefixed by next-intl Link). */
  pagePath: "/cv",
  /** Optional static PDF in /public — used when present. */
  pdfPath: "/resume.pdf",
} as const
