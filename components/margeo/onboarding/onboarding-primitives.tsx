"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/margeo/utils";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 32 };

export function OnboardingProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="onboarding-progress" aria-hidden>
      <div className="onboarding-progress-track">
        <motion.div
          className="onboarding-progress-fill"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
        />
      </div>
      <p className="onboarding-progress-label">
        Étape {step + 1} sur {total}
      </p>
    </div>
  );
}

export function OnboardingStepHeader({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="onboarding-step-header">
      <h2 className="onboarding-step-title text-gradient">{title}</h2>
      {subtitle ? (
        <p className="onboarding-step-subtitle">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function OnboardingSelectCard({
  selected,
  onSelect,
  icon,
  label,
  description,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={SPRING}
      className={cn(
        "onboarding-select-card",
        selected && "onboarding-select-card-selected",
        className,
      )}
      aria-pressed={selected}
    >
      <span className="onboarding-select-card-icon">{icon}</span>
      <div
        className={cn(
          description && "onboarding-select-card-text",
          !description && "contents",
        )}
      >
        <span className="onboarding-select-card-label">{label}</span>
        {description ? (
          <span className="onboarding-select-card-desc">{description}</span>
        ) : null}
      </div>
      {selected ? (
        <motion.span
          className="onboarding-select-card-check"
          initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING}
        >
          <Check className="size-3.5" strokeWidth={2.5} />
        </motion.span>
      ) : null}
    </motion.button>
  );
}

export function OnboardingSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="onboarding-slider">
      <div className="onboarding-slider-value-wrap">
        <motion.output
          key={value}
          className="onboarding-slider-value"
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={SPRING}
        >
          {formatValue(value)}
        </motion.output>
      </div>

      <div className="onboarding-slider-track-wrap">
        <div
          className="onboarding-slider-fill"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          className="onboarding-slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {(minLabel || maxLabel) && (
        <div className="onboarding-slider-bounds">
          <span>{minLabel ?? formatValue(min)}</span>
          <span>{maxLabel ?? formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}

export function OnboardingSegmentControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="onboarding-segment" role="group">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={SPRING}
            className={cn(
              "onboarding-segment-item",
              selected && "onboarding-segment-item-selected",
            )}
            aria-pressed={selected}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function OnboardingSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="onboarding-summary-row">
      <span className="onboarding-summary-label">{label}</span>
      <span className="onboarding-summary-value">{value}</span>
    </div>
  );
}
