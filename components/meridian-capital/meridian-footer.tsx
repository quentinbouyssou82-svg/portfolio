import { DemoNotice } from "@/components/demos/demo-notice";

export function MeridianFooter() {
  return (
    <footer className="relative border-t border-[var(--mc-border-subtle)] bg-[var(--mc-bg-secondary)] py-14">
      <div className="meridian-wrap">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <p className="mc-logo text-[var(--mc-text-muted)]">
            Meridian<span className="mc-gold-text">.</span>
          </p>
          <p className="mc-body-sm">
            © {new Date().getFullYear()} Meridian Capital · Démonstration conceptuelle
          </p>
        </div>
        <div className="mt-12">
          <DemoNotice variant="dark" />
        </div>
      </div>
    </footer>
  );
}
