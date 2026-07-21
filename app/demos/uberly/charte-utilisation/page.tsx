import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("charte-utilisation");

export default function Page() {
  return <UberlyLegalPage id="charte-utilisation" />;
}
