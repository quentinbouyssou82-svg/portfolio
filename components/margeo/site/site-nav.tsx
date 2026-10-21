import Image from "next/image";
import Link from "next/link";
import { DRIVEELY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import { driveelyRoutes } from "@/lib/margeo/routes";

export function SiteNav() {
  return (
    <header
      data-site-nav
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
    >
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-5 sm:h-14 sm:px-8">
        <Link
          href={driveelyRoutes.home}
          className="flex min-h-11 items-center gap-2 text-[15px] font-semibold tracking-tight text-[#FAFAFA]"
        >
          <Image
            src="/driveely/marketing/app-icon.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-[7px]"
            priority
          />
          Driveely
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
            className="inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-[#FAFAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]"
          >
            E-mail
          </a>
          <Link
            href={driveelyRoutes.contact}
            className="inline-flex min-h-9 items-center rounded-full bg-[#FAFAFA] px-3.5 text-[13px] font-semibold text-[#09090B] transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8] sm:px-4"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
