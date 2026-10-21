/** Store badge targets — fill when URLs exist. Never invent store links. */
export const DRIVEELY_APP_STORE_URL =
  process.env.NEXT_PUBLIC_DRIVEELY_APP_STORE_URL?.trim() || "";

export const DRIVEELY_PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_DRIVEELY_PLAY_STORE_URL?.trim() || "";

export type StoreKind = "apple" | "google";

export function storeHref(kind: StoreKind): string | null {
  const url = kind === "apple" ? DRIVEELY_APP_STORE_URL : DRIVEELY_PLAY_STORE_URL;
  return url.length > 0 ? url : null;
}
