import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("suppression-donnees");

export default function Page() {
  return <DriveelyLegalPage id="suppression-donnees" />;
}
