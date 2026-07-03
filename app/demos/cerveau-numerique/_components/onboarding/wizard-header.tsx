import { BrandIcon } from "../ui/brand-icon";

export function WizardHeader({ tagline }: { tagline: string }) {
  return (
    <header className="flex items-center justify-center gap-2 pt-6 text-sm font-medium">
      <BrandIcon size="sm" />
      <span>
        Mon Cerveau Numérique{" "}
        <span className="text-[var(--cn-muted)]">· {tagline}</span>
      </span>
    </header>
  );
}
