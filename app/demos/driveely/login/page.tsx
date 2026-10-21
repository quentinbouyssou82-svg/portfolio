import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { StoreBadgeRow } from "@/components/margeo/site/store-badges";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = buildDriveelyMetadata({
  title: "Connexion",
  description: `${PRODUCT_NAME} s’utilise sur iPhone. Télécharge l’app pour te connecter.`,
  path: "/login",
  index: false,
});

/** Web login retired — product is iOS-only. Keep route for old links. */
export default function LoginRedirectPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F2F2F7] px-5 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8E8E93]">
        {PRODUCT_NAME}
      </p>
      <h1 className="mt-3 max-w-sm text-[1.75rem] font-bold tracking-tight text-black">
        Driveely s’utilise sur iPhone.
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#636366]">
        L’application web a été retirée. Télécharge Driveely pour te connecter
        et analyser tes courses.
      </p>
      <div className="mt-8">
        <StoreBadgeRow />
      </div>
      <Link
        href="/"
        className="mt-6 text-[14px] font-medium text-[#636366] underline-offset-2 hover:underline"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
