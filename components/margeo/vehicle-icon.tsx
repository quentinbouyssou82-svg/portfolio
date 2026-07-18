import type { Vehicle } from "@/lib/margeo/types";
import { normalizeVehicle } from "@/lib/margeo/vehicle-costs";
import { cn } from "@/lib/margeo/utils";

interface VehicleIconProps {
  vehicle: Vehicle;
  className?: string;
  selected?: boolean;
}

/** Icônes véhicule distinctes par catégorie. */
export function VehicleIcon({ vehicle, className, selected }: VehicleIconProps) {
  const stroke = selected ? "var(--color-mg-accent)" : "currentColor";
  const id = normalizeVehicle(vehicle);
  const cls = cn("size-6", className);

  if (id === "velo" || id === "velo_electrique") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
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
        {id === "velo_electrique" && (
          <path
            d="M14 4.5 12.5 7h2L13 9.5"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    );
  }

  if (id === "trottinette_electrique") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
        <circle cx="7" cy="18" r="2.5" stroke={stroke} strokeWidth="1.75" />
        <circle cx="17" cy="18" r="2.5" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M7 18h8M15 18 13 8h-2"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 8V5.5"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M14 5h2v2"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (
    id === "scooter_thermique" ||
    id === "scooter_electrique" ||
    id === "moto"
  ) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
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
        {id === "scooter_electrique" ? (
          <path
            d="M15 5.5 13.8 7.5h1.8L14.2 9.5"
            stroke={stroke}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : id === "moto" ? (
          <path
            d="M14 7h3M15.5 7v2"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ) : (
          <path d="M14 7h2" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
        )}
      </svg>
    );
  }

  // Voitures
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
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
      {(id === "voiture_electrique" || id === "voiture_hybride") && (
        <path
          d="M12 5.2 10.8 7h1.8L11.2 9"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {id === "voiture_diesel" && (
        <path
          d="M18.5 11.5h1.5"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
