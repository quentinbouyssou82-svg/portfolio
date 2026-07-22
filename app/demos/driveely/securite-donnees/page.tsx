import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("securite-donnees");

export default function Page() {
  return <DriveelyLegalPage id="securite-donnees" />;
}
