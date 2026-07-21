import { UberlyLegalPage, buildLegalMetadata } from "@/components/margeo/uberly-legal-page";

export const metadata = buildLegalMetadata("cgv");

export default function Page() {
  return <UberlyLegalPage id="cgv" />;
}
