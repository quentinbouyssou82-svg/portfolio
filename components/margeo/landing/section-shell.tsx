import { Reveal } from "@/components/margeo/reveal";
import { cn } from "@/lib/margeo/utils";

interface SectionShellProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  align?: "center" | "left";
  border?: boolean;
}

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  align = "center",
  border = false,
}: SectionShellProps) {
  const centered = align === "center";

  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-20 sm:py-28",
        border && "border-t border-mg-border",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-5 pb-[env(safe-area-inset-bottom)]">
        <Reveal
          className={cn("max-w-3xl", centered ? "mx-auto text-center" : "")}
        >
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl",
              eyebrow ? "" : "mt-0",
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "mt-4 text-base leading-relaxed text-mg-muted text-pretty sm:text-lg",
                centered && "mx-auto",
              )}
            >
              {description}
            </p>
          )}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}
