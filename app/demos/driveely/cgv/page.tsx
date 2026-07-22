import { DriveelyLegalPage, buildLegalMetadata } from "@/components/margeo/driveely-legal-page";

export const metadata = buildLegalMetadata("cgv");

export default function Page() {
  return <DriveelyLegalPage id="cgv" />;
}
