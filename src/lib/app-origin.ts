/** Public base URL for on-chain metadata pointers (prefer production over localhost). */
export function resolveAppOrigin(requestOrigin: string): string {
  const configured =
    process.env.PASSPORT_METADATA_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (configured) {
    const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
    return withProtocol.replace(/\/$/, "");
  }

  return requestOrigin.replace(/\/$/, "");
}
