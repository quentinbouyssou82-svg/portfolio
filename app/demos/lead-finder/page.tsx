import { DemoNotice } from "@/components/demos/demo-notice";

export default function LeadFinderPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--lead-muted)]">
        Projet conceptuel
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
        Lead Finder
      </h1>
      <p className="mt-4 max-w-lg text-base text-[var(--lead-muted)]">
        Démo en cours de construction.
      </p>
      <div className="mt-10 w-full max-w-xl">
        <DemoNotice variant="dark" />
      </div>
    </main>
  );
}
