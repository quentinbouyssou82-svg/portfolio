import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("abonnements-stripe");

export default function Page() {
  return <DriveelyLegalPage id="abonnements-stripe" />;
}
