/** Dev-only responsive preview — never enabled in production unless explicitly opted in. */
export function isResponsivePreviewAvailable() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_RESPONSIVE_PREVIEW === "true"
  );
}
