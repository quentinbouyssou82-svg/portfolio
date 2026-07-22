import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("propriete-intellectuelle");

export default function Page() {
  return <DriveelyLegalPage id="propriete-intellectuelle" />;
}
