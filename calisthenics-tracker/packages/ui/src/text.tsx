import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

type TextVariant =
  | "display"
  | "hero"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "label";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  as?: "p" | "span" | "h1" | "h2" | "h3";
  muted?: boolean;
}

const variantClass: Record<TextVariant, string> = {
  display: "cali-text-display",
  hero: "cali-text-hero",
  title: "cali-text-title",
  subtitle: "cali-text-subtitle",
  body: "cali-text-body",
  caption: "cali-text-caption",
  label: "cali-text-label",
};

export function Text({
  variant = "body",
  as: Tag = "p",
  muted,
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        variantClass[variant],
        muted ? "text-cali-text-muted" : "text-cali-text",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
