import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("demandes-rgpd");

export default function Page() {
  return <UberlyLegalPage id="demandes-rgpd" />;
}
