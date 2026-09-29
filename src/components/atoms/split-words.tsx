import { Fragment } from "react"

type SplitWordsProps = {
  text: string
  /** Extra class for each inner word (the animated node). */
  wordClassName?: string
}

/**
 * Renders text as masked words so motion can rise each word from below its
 * clip box. React owns every node — no runtime DOM splitting.
 */
export function SplitWords({ text, wordClassName }: SplitWordsProps) {
  const words = text.split(/\s+/).filter(Boolean)

  return words.map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      <span className="reveal-mask">
        <span data-word className={wordClassName ?? "reveal-word"}>
          {word}
        </span>
      </span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ))
}
