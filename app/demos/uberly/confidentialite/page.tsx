import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("confidentialite");

export default function Page() {
  return <UberlyLegalPage id="confidentialite" />;
}
