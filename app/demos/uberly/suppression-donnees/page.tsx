import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("suppression-donnees");

export default function Page() {
  return <UberlyLegalPage id="suppression-donnees" />;
}
