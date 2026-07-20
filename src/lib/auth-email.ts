const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  return process.env.AUTH_EMAIL_FROM?.trim() || "BetterDev <onboarding@resend.dev>";
}

export async function sendLoginCodeEmail(email: string, code: string): Promise<{ sent: boolean; devCode?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[auth] Login code for ${email}: ${code}`);
      return { sent: false, devCode: code };
    }
    throw new Error("Email delivery is not configured.");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [email],
      subject: "Your BetterDev login code",
      text: `Your BetterDev login code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>Your BetterDev login code is <strong style="font-size:20px;letter-spacing:0.15em">${code}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[auth/email]", res.status, body);
    throw new Error("Could not send login code email.");
  }

  return { sent: true };
}
