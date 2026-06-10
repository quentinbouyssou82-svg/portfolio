type McnPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function McnPageHeader({ eyebrow, title, description }: McnPageHeaderProps) {
  return (
    <header className="mb-8 space-y-1">
      {eyebrow ? (
        <p className="text-xs font-medium capitalize tracking-wide text-[var(--mcn-fg-subtle)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-xl font-semibold tracking-tight text-[var(--mcn-fg)] md:text-2xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-[var(--mcn-fg-muted)]">{description}</p>
      ) : null}
    </header>
  );
}
