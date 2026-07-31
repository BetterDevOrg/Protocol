import type { StoredBuilderCircle } from "@/lib/builder-circle-config";

const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  return process.env.AUTH_EMAIL_FROM?.trim() || "BetterDev <onboarding@resend.dev>";
}

function getAppBaseUrl(): string {
  return (
    process.env.PASSPORT_METADATA_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://betterdev.live"
  ).replace(/\/$/, "");
}

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; logged?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.info(`[builder-circle-email] To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}`);
    return { sent: false, logged: true };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[builder-circle-email]", res.status, body);
    throw new Error("Could not send Builder Circle email.");
  }

  return { sent: true };
}

export async function sendBuilderCircleAssignmentEmails(input: {
  eventName: string;
  meetupId: string;
  circles: StoredBuilderCircle[];
  emailByCommunityId: Map<string, string>;
}): Promise<{ sent: number; logged: number; skipped: number }> {
  const { eventName, meetupId, circles, emailByCommunityId } = input;
  const baseUrl = getAppBaseUrl();
  let sent = 0;
  let logged = 0;
  let skipped = 0;

  for (const circle of circles) {
    for (const member of circle.members) {
      const email = emailByCommunityId.get(member.communityId.trim().toUpperCase())?.trim();
      if (!email) {
        skipped += 1;
        continue;
      }

      const circlesUrl = `${baseUrl}/meetup/${encodeURIComponent(meetupId)}/circles?communityId=${encodeURIComponent(member.communityId)}`;
      const tableMates = circle.members
        .filter((mate) => mate.communityId !== member.communityId)
        .map((mate) => `- ${mate.fullName}${mate.role ? ` (${mate.role})` : ""}`)
        .join("\n");

      const subject = `Your Builder Circle for ${eventName}`;
      const text = [
        `Hi ${member.fullName || member.communityId},`,
        "",
        `You've been assigned to ${circle.id} for ${eventName}.`,
        "",
        "Your table:",
        tableMates || "(just you for now)",
        "",
        `View your group: ${circlesUrl}`,
        "",
        "See you at the meetup!",
      ].join("\n");

      const html = `<p>Hi ${member.fullName || member.communityId},</p>
<p>You've been assigned to <strong>${circle.id}</strong> for <strong>${eventName}</strong>.</p>
<p><strong>Your table:</strong></p>
<ul>${circle.members
        .filter((mate) => mate.communityId !== member.communityId)
        .map((mate) => `<li>${mate.fullName}${mate.role ? ` (${mate.role})` : ""}</li>`)
        .join("")}</ul>
<p><a href="${circlesUrl}">View your group →</a></p>`;

      try {
        const result = await sendEmail({ to: email, subject, text, html });
        if (result.sent) sent += 1;
        if (result.logged) logged += 1;
      } catch (e) {
        console.error("[builder-circle-email] failed for", member.communityId, e);
      }
    }
  }

  return { sent, logged, skipped };
}
