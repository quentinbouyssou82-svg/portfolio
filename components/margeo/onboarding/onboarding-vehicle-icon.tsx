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
  return (
    <VehicleIcon
      vehicle={vehicle}
      selected={selected}
      className={cn("size-7", className)}
    />
  );
}
