import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("cookies");

export default function Page() {
  return <DriveelyLegalPage id="cookies" />;
}
