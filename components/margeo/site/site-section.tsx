import type { ReactNode } from "react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/margeo/utils";

type SiteSectionProps = {
  id?: string;
  label?: string;
  title: ReactNode;
  description?: string;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
  centered?: boolean;
};

export function SiteSection({
  id,
  label,
  title,
  description,
  className,
  innerClassName,
  children,
  centered = true,
}: SiteSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-[calc(4.5rem+env(safe-area-inset-top))] border-t border-white/[0.06] px-4 py-16 sm:px-8 sm:py-20",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-5xl", innerClassName)}>
        <Reveal>
          <div className={cn(centered && "text-center")}>
            {label ? (
              <p className="site-section-label mb-3">{label}</p>
            ) : null}
            <h2 className="text-[1.55rem] font-bold tracking-[-0.03em] text-[#FAFAFA] sm:text-[2.1rem]">
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-3 max-w-xl text-[14px] leading-relaxed text-[#A1A1AA] sm:text-[15px]",
                  centered && "mx-auto",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
