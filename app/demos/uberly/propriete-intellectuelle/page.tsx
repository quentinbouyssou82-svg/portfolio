import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("propriete-intellectuelle");

export default function Page() {
  return <UberlyLegalPage id="propriete-intellectuelle" />;
}
