import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("conditions-beta");

export default function Page() {
  return <DriveelyLegalPage id="conditions-beta" />;
}
