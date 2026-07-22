import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("mentions-legales");

export default function Page() {
  return <DriveelyLegalPage id="mentions-legales" />;
}
