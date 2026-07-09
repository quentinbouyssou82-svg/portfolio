import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn.js";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex flex-col gap-2">
      {label && (
        <span className="cali-text-label text-cali-text-muted">{label}</span>
      )}
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-xl border border-cali-border bg-cali-bg-elevated/80 px-4",
          "cali-text-body text-cali-text tabular-nums",
          "placeholder:text-cali-text-muted/60",
          "focus:outline-none focus:ring-2 focus:ring-cali-accent/40 focus:border-cali-accent/30",
          "transition-shadow duration-200",
          className,
        )}
        {...props}
      />
    </label>
  ),
);
Input.displayName = "Input";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex min-h-0 flex-1 flex-col gap-2">
      {label && (
        <span className="cali-text-label text-cali-text-muted">{label}</span>
      )}
      <textarea
        ref={ref}
        className={cn(
          "min-h-[14rem] w-full flex-1 resize-none rounded-xl border border-cali-border",
          "bg-cali-bg-elevated/60 p-4 cali-text-caption leading-relaxed text-cali-text",
          "placeholder:text-cali-text-muted/50",
          "focus:outline-none focus:ring-2 focus:ring-cali-accent/40 focus:border-cali-accent/30",
          "transition-all duration-200",
          className,
        )}
        {...props}
      />
    </label>
  ),
);
TextArea.displayName = "TextArea";
