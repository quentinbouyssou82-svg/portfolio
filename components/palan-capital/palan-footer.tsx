export function PalanFooter() {
  return (
    <footer className="border-t border-[var(--ax-border-subtle)] bg-[var(--ax-bg-elevated)] py-14">
      <div className="apex-wrap">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md text-center md:text-left">
            <p className="ax-logo text-[var(--ax-text-muted)]">
              Palan<span className="ax-gold-text"> Capital</span>
            </p>
            <p className="ax-body-sm mt-4">
              Cabinet indépendant d&apos;ingénierie financière et de structuration patrimoniale.
              France · Luxembourg · Émirats Arabes Unis.
            </p>
          </div>
          <p className="ax-body-sm max-w-sm text-center md:text-right">
            SAS LIVING · SIREN 983 940 958 · RCS Toulouse
            <br />
            ORIAS IOBSP 2021 · CIF en cours
          </p>
        </div>
        <p className="ax-body-sm mt-10 text-center text-[var(--ax-text-muted)]">
          © {new Date().getFullYear()} Palan Capital
        </p>
        <aside className="ax-demo-notice mt-12">
          <strong>Démonstration · Offre Starter (1 page)</strong>
          <p className="mt-1.5">
            Ce site conceptuel regroupe toutes les sections en une seule page défilante.
            Selon votre abonnement (Pro, Premium), votre site peut inclure plusieurs pages
            distinctes avec une navigation complète.
          </p>
        </aside>
      </div>
    </footer>
  );
}
