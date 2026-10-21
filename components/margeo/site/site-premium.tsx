import {
  PREMIUM_ANNUAL_EUR,
  PREMIUM_MONTHLY_EUR,
  PREMIUM_TRIAL_DAYS,
} from "@/lib/margeo/brand";
import { Reveal } from "./reveal";
import { SiteSection } from "./site-section";

export function SitePremium() {
  return (
    <SiteSection
      id="premium"
      label="Premium"
      title="Analysez sans limite."
      description="Pour décider plus vite, toute la journée."
      className="bg-[#09090B]"
    >
      <Reveal delay={0.08}>
        <div className="site-card site-card-accent mx-auto mt-8 max-w-md rounded-3xl px-5 py-8 sm:mt-10 sm:px-10 sm:py-10">
          <p className="text-center text-[1.75rem] font-bold tracking-tight text-[#FAFAFA] sm:text-[2rem]">
            {PREMIUM_MONTHLY_EUR} €
            <span className="text-[16px] font-medium text-[#A1A1AA]">
              {" "}
              / mois
            </span>
          </p>
          <p className="mt-2 text-center text-[15px] text-[#A1A1AA]">
            ou {PREMIUM_ANNUAL_EUR} € / an · {PREMIUM_TRIAL_DAYS} jours d’essai
            gratuit
          </p>
          <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left text-[15px] text-[#A1A1AA]">
            <li className="flex gap-2">
              <span className="text-[#818CF8]">•</span> Analyses illimitées
            </li>
            <li className="flex gap-2">
              <span className="text-[#818CF8]">•</span> Historique complet
            </li>
            <li className="flex gap-2">
              <span className="text-[#818CF8]">•</span> Back Tap & Centre de
              contrôle
            </li>
          </ul>
        </div>
      </Reveal>
    </SiteSection>
  );
}
