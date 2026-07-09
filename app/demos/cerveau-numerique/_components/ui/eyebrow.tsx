export function Eyebrow({
  children,
  pulse = true,
}: {
  children: React.ReactNode;
  pulse?: boolean;
}) {
  return (
    <span className="cn-pill cn-mono inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-medium uppercase text-[var(--cn-muted)]">
      {pulse && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--cn-primary)] opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-[var(--cn-primary)]" />
        </span>
      )}
      {children}
    </span>
  );
}
