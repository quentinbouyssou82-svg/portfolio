import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-[#0ea5e9] shadow-[0_0_16px_rgba(52,211,153,0.35)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 text-[#04120c]"
          aria-hidden
        >
          <path
            d="M4 18 9 7l3.5 7L16 9l4 9"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Margeo
        </span>
      )}
    </span>
  );
}
