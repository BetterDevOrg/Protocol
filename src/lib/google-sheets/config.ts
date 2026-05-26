export function isGoogleSheetsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim() && process.env.GOOGLE_SHEETS_API_TOKEN?.trim());
}

export function getGoogleSheetsConfig(): { webappUrl: string; apiToken: string } {
  const webappUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL?.trim();
  const apiToken = process.env.GOOGLE_SHEETS_API_TOKEN?.trim();
  if (!webappUrl || !apiToken) {
    throw new Error("Missing Google Sheets configuration (GOOGLE_SHEETS_WEBAPP_URL, GOOGLE_SHEETS_API_TOKEN).");
  }
  return { webappUrl, apiToken };
}
