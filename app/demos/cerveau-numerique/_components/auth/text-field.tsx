"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "../../_lib/cn";

type BaseProps = {
  label: string;
  icon?: LucideIcon;
} & React.InputHTMLAttributes<HTMLInputElement>;

const fieldBase =
  "w-full rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] bg-[var(--cn-surface)] py-2.5 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] transition-colors focus:border-[var(--cn-primary-border)] focus:bg-[var(--cn-surface-2)]";

export function TextField({ label, icon: Icon, className, ...props }: BaseProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--cn-muted)]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--cn-faint)]" />
        )}
        <input
          id={id}
          className={cn(fieldBase, Icon ? "pl-10 pr-3" : "px-3", className)}
          {...props}
        />
      </div>
    </div>
  );
}

export function PasswordField({ label, icon: Icon, className, ...props }: BaseProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-[var(--cn-muted)]">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--cn-faint)]" />
        )}
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={cn(fieldBase, "pr-10", Icon ? "pl-10" : "pl-3", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--cn-faint)] transition-colors hover:text-[var(--cn-muted)]"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
