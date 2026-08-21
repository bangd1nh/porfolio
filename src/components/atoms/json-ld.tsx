type JsonLdProps = {
  data: Record<string, unknown>
}

/**
 * JSON-LD is injected as a raw script so crawlers can read it without React
 * escaping. `<` is escaped to avoid breaking out of the script tag.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c")

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
