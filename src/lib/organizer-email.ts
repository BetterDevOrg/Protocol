import type { Organizer } from "@/types/organizer";

const RESEND_API_URL = "https://api.resend.com/emails";

function getFromAddress(): string {
  return process.env.AUTH_EMAIL_FROM?.trim() || "BetterDev <onboarding@resend.dev>";
}

function getFounderEmail(): string {
  return process.env.ORGANIZER_FOUNDER_EMAIL?.trim() || "betterdevcommunity.team@gmail.com";
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
    console.info(`[organizer-email] To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}`);
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
    console.error("[organizer-email]", res.status, body);
    throw new Error("Could not send organizer email.");
  }

  return { sent: true };
}

export async function sendOrganizerApplicationToFounder(input: {
  organizer: Organizer;
  applicantEmail: string;
}): Promise<{ sent: boolean; logged?: boolean }> {
  const { organizer, applicantEmail } = input;
  const founderEmail = getFounderEmail();
  const subject = `New city organizer application — ${organizer.city}, ${organizer.country}`;
  const text = [
    "A new BetterDev city organizer application was submitted.",
    "",
    `Name: ${organizer.fullName}`,
    `Email: ${applicantEmail}`,
    `Community ID: ${organizer.communityId}`,
    `Organizer ID: ${organizer.organizerId}`,
    `City: ${organizer.city}`,
    `Country: ${organizer.country}`,
    organizer.bio ? `Bio: ${organizer.bio}` : "",
    "",
    "Next steps:",
    "1. Review the applicant and schedule an interview.",
    "2. Approve via POST /api/organizers/{organizerId}/approve with your founder secret.",
    "3. The applicant will receive their unique organizer key by email.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<p>A new BetterDev city organizer application was submitted.</p>
<ul>
<li><strong>Name:</strong> ${organizer.fullName}</li>
<li><strong>Email:</strong> ${applicantEmail}</li>
<li><strong>Community ID:</strong> ${organizer.communityId}</li>
<li><strong>Organizer ID:</strong> ${organizer.organizerId}</li>
<li><strong>City:</strong> ${organizer.city}</li>
<li><strong>Country:</strong> ${organizer.country}</li>
${organizer.bio ? `<li><strong>Bio:</strong> ${organizer.bio}</li>` : ""}
</ul>
<p>Review the applicant, then approve via the founder approve API to generate their organizer key.</p>`;

  return sendEmail({ to: founderEmail, subject, text, html });
}

export async function sendOrganizerApprovedToApplicant(input: {
  organizer: Organizer;
  organizerSecret: string;
  applicantEmail: string;
}): Promise<{ sent: boolean; logged?: boolean }> {
  const { organizer, organizerSecret, applicantEmail } = input;
  const createUrl = `${getAppBaseUrl()}/organizer/create`;
  const subject = "You're approved as a BetterDev city organizer";
  const text = [
    `Hi ${organizer.fullName},`,
    "",
    "Congratulations — you've been approved as a BetterDev city organizer.",
    "",
    `Your assigned city: ${organizer.city}, ${organizer.country}`,
    `Organizer ID: ${organizer.organizerId}`,
    "",
    "Your unique organizer key (keep this private):",
    organizerSecret,
    "",
    `Create meetups anytime at: ${createUrl}`,
    "",
    "Paste your organizer key on that page to create events, generate check-in QR codes, and run Builder Circles.",
  ].join("\n");

  const html = `<p>Hi ${organizer.fullName},</p>
<p>Congratulations — you've been approved as a BetterDev city organizer for <strong>${organizer.city}, ${organizer.country}</strong>.</p>
<p>Organizer ID: <strong>${organizer.organizerId}</strong></p>
<p>Your unique organizer key (keep this private):</p>
<p style="font-family:monospace;font-size:14px;padding:12px;background:#111;color:#fff;border-radius:8px;word-break:break-all">${organizerSecret}</p>
<p><a href="${createUrl}">Open the create event page →</a></p>
<p>Paste your organizer key on that page to host meetups in your city.</p>`;

  return sendEmail({ to: applicantEmail, subject, text, html });
}
