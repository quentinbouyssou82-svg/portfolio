import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("charte-utilisation");

export default function Page() {
  return <DriveelyLegalPage id="charte-utilisation" />;
}
