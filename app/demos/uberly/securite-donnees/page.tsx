import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("securite-donnees");

export default function Page() {
  return <UberlyLegalPage id="securite-donnees" />;
}
