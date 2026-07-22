import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("demandes-rgpd");

export default function Page() {
  return <DriveelyLegalPage id="demandes-rgpd" />;
}
