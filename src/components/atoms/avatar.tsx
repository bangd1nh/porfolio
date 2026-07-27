import { cn } from "@/lib/utils"

type AvatarProps = React.ComponentProps<"div"> & {
  alt?: string
  src?: string
  initials?: string
}

export function Avatar({
  alt = "Avatar",
  src,
  initials,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "overflow-hidden rounded-none border border-border bg-muted",
        className
      )}
      style={
        src
          ? {
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      {...props}
    >
      {!src && initials ? (
        <span className="grid size-full place-items-center font-heading text-2xl font-bold text-foreground">
          {initials}
        </span>
      ) : null}
    </div>
  )
}
