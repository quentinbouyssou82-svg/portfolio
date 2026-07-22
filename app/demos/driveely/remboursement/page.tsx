import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("remboursement");

export default function Page() {
  return <DriveelyLegalPage id="remboursement" />;
}
