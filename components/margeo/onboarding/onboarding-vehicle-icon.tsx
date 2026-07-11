import type { OnboardingVehicleId } from "@/components/margeo/onboarding/onboarding-types";
import { VehicleIcon } from "@/components/margeo/vehicle-icon";
import { cn } from "@/lib/margeo/utils";

export function OnboardingVehicleIcon({
  vehicle,
  selected,
  className,
}: {
  vehicle: OnboardingVehicleId;
  selected?: boolean;
  className?: string;
}) {
  const stroke = selected ? "var(--color-mg-accent)" : "currentColor";

  if (vehicle === "moto") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("size-7", className)}
        aria-hidden
      >
        <circle cx="6.5" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <circle cx="17.5" cy="17" r="3" stroke={stroke} strokeWidth="1.75" />
        <path
          d="M6.5 17 10 11h3l2 3h5.5"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 11V8h4l1.5 3"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 8h2.5" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  const mapped =
    vehicle === "scooter" ? "scooter" : vehicle;

  return (
    <VehicleIcon
      vehicle={mapped}
      selected={selected}
      className={cn("size-7", className)}
    />
  );
}
