import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("confidentialite");

export default function Page() {
  return <DriveelyLegalPage id="confidentialite" />;
}
