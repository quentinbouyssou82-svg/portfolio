"use client";

import { forwardRef, useEffect, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/margeo/ui/input";
import { cn } from "@/lib/margeo/utils";

type NumericInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  /** null = champ vide affiché */
  value: number | null;
  onValueChange: (value: number) => void;
  decimals?: number;
  allowEmpty?: boolean;
};

/**
 * Champ numérique : on peut tout effacer puis retaper.
 * Commit au blur / Enter — plus de forçage à 0 pendant la saisie.
 */
export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput(
    {
      value,
      onValueChange,
      decimals = 2,
      allowEmpty = true,
      className,
      onBlur,
      onFocus,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const format = (n: number | null) => {
      if (n == null || !Number.isFinite(n)) return "";
      return String(Number(n.toFixed(decimals)));
    };

    const [text, setText] = useState(() => format(value));
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) setText(format(value));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, focused, decimals]);

    const commit = (raw: string) => {
      const normalized = raw.trim().replace(",", ".");
      if (normalized === "" || normalized === "-" || normalized === ".") {
        if (allowEmpty) {
          onValueChange(0);
          setText("");
          return;
        }
        setText(format(value));
        return;
      }
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed)) {
        setText(format(value));
        return;
      }
      const next = Number(parsed.toFixed(decimals));
      onValueChange(next);
      setText(format(next));
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        className={cn(className)}
        value={text}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onChange={(e) => {
          const next = e.target.value;
          if (next !== "" && !/^-?\d*[.,]?\d*$/.test(next)) return;
          setText(next);
        }}
        onBlur={(e) => {
          setFocused(false);
          commit(text);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          onKeyDown?.(e);
        }}
      />
    );
  },
);
