"use client";

import type { LucideIcon } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/margeo/utils";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon: Icon, className, id, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <label className="auth-field block" htmlFor={fieldId}>
        <span className="auth-field-label">{label}</span>
        <div className="auth-field-input-wrap mt-2">
          <Icon className="auth-field-icon size-4" aria-hidden />
          <input
            ref={ref}
            id={fieldId}
            className={cn("auth-field-input", className)}
            {...props}
          />
        </div>
      </label>
    );
  },
);

AuthField.displayName = "AuthField";
