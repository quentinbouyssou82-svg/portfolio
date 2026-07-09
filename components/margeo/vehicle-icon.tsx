import type { Vehicle } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

interface VehicleIconProps {
  vehicle: Vehicle;
  className?: string;
  selected?: boolean;
}

/** Icônes véhicule distinctes (vélo ≠ scooter/moto). */
export function VehicleIcon({ vehicle, className, selected }: VehicleIconProps) {
  const stroke = selected ? "var(--color-mg-accent)" : "currentColor";

  if (vehicle === "velo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden>
        <circle cx="6" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <circle cx="18" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M6 17 10 9h4l2 3h3"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 9V6" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (vehicle === "velo_electrique") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden>
        <circle cx="6" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <circle cx="18" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M6 17 10 9h3l2 3h4"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13 9v-2" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        <path
          d="M15 5h2v2"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (vehicle === "scooter") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden>
        <circle cx="7" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <circle cx="17" cy="17" r="2.5" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M7 17 11 10h2l1 4h4"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11 10V7h3" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        <path d="M14 7h2" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden>
      <path
        d="M5 17h14l-1.5-5H8L6 17Z"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="17.5" r="2" stroke={stroke} strokeWidth="1.75" />
      <circle cx="16.5" cy="17.5" r="2" stroke={stroke} strokeWidth="1.75" />
      <path d="M5 17H3" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 12V9h6v3" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
