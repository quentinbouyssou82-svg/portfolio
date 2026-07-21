import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("remboursement");

export default function Page() {
  return <UberlyLegalPage id="remboursement" />;
}
