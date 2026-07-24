import { SubscriptionManageView } from "@/components/margeo/subscription/subscription-manage-view";
import { getAppFeatures } from "@/lib/margeo/config";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { getAuthUser } from "@/lib/margeo/auth/session";
import {
  getCurrentSubscription,
  getUserEntitlements,
  listSubscriptionHistory,
} from "@/lib/margeo/services/subscription";
import { redirect } from "next/navigation";

export default async function SubscriptionPage() {
  const user = await getAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  if (!getAppFeatures().billing) {
    redirect(DRIVEELY_PATHS.premium);
  }

  const [subscription, entitlements, history] = await Promise.all([
    getCurrentSubscription(user.id),
    getUserEntitlements(user.id),
    listSubscriptionHistory(user.id),
  ]);

  return (
    <SubscriptionManageView
      subscription={subscription}
      entitlements={entitlements}
      history={history}
    />
  );
}
