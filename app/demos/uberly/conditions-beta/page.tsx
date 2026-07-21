import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("conditions-beta");

export default function Page() {
  return <UberlyLegalPage id="conditions-beta" />;
}
