import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("cgu");

export default function Page() {
  return <DriveelyLegalPage id="cgu" />;
}
