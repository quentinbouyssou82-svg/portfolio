type DemoNoticeProps = {
  variant?: "dark" | "light" | "gold";
};

export function DemoNotice({ variant = "dark" }: DemoNoticeProps) {
  const styles = {
    dark: "border-white/10 bg-white/[0.04] text-white/55",
    light: "border-[var(--nova-border)] bg-[var(--nova-bg)] text-[var(--nova-muted)]",
    gold: "border-[#c9a962]/20 bg-[#c9a962]/[0.06] text-[var(--bella-muted)]",
  };

  return (
    <aside
      className={`mx-auto max-w-3xl rounded-2xl border px-5 py-4 text-center text-xs leading-relaxed sm:text-sm ${styles[variant]}`}
    >
      <strong className="font-semibold text-inherit opacity-90">
        Démonstration · Offre Starter (1 page)
      </strong>
      <p className="mt-1.5">
        Ce site conceptuel regroupe toutes les sections en une seule page défilante.
        Selon votre abonnement (Pro, Premium), votre site peut inclure plusieurs pages
        distinctes avec une navigation complète.
      </p>
    </aside>
  );
}
