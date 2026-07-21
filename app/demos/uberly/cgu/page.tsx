import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("cgu");

export default function Page() {
  return <UberlyLegalPage id="cgu" />;
}
