import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("abonnements-stripe");

export default function Page() {
  return <UberlyLegalPage id="abonnements-stripe" />;
}
