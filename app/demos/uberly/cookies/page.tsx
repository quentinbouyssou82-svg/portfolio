import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("cookies");

export default function Page() {
  return <UberlyLegalPage id="cookies" />;
}
