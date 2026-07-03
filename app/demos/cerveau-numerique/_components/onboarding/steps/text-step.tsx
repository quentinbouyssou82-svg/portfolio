"use client";

export function TextStep({
  value,
  onChange,
  placeholder = "Ton prénom",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] bg-[var(--cn-surface)] px-4 py-3 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] transition-colors focus:border-[var(--cn-primary-border)] focus:bg-[var(--cn-surface-2)]"
    />
  );
}
