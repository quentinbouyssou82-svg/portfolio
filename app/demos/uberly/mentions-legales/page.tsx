import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("mentions-legales");

export default function Page() {
  return <UberlyLegalPage id="mentions-legales" />;
}
