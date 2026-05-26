/**
 * BetterDev — Google Apps Script (bound to your spreadsheet).
 * Deploy as Web app: Execute as Me, Who has access: Anyone.
 * Protect with API_TOKEN query param (set in .env.local on Next.js).
 *
 * Sheet tab: submissions
 * Columns (row 1 headers):
 * created_at | full_name | email | phone_e164 | country | city | x_username |
 * x_profile_link | followed_x | joined_community | member_number | community_id |
 * invite_slug | source_ip | user_agent
 */
const SHEET_NAME = "submissions";
const API_TOKEN = "REPLACE_WITH_YOUR_SECRET";

const COL = {
  CREATED_AT: 0,
  FULL_NAME: 1,
  EMAIL: 2,
  PHONE: 3,
  COUNTRY: 4,
  CITY: 5,
  X_USERNAME: 6,
  X_PROFILE: 7,
  FOLLOWED_X: 8,
  JOINED: 9,
  MEMBER_NUMBER: 10,
  COMMUNITY_ID: 11,
  INVITE_SLUG: 12,
  SOURCE_IP: 13,
  USER_AGENT: 14,
};

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function unauthorized() {
  return jsonOutput({ ok: false, error: "unauthorized" });
}

function checkToken(e) {
  const token = (e.parameter && e.parameter.token) || "";
  return token === API_TOKEN;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow([
      "created_at",
      "full_name",
      "email",
      "phone_e164",
      "country",
      "city",
      "x_username",
      "x_profile_link",
      "followed_x",
      "joined_community",
      "member_number",
      "community_id",
      "invite_slug",
      "source_ip",
      "user_agent",
    ]);
  }
  return sh;
}

function nextMemberNumber_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return 1;
  const numbers = sh
    .getRange(2, COL.MEMBER_NUMBER + 1, lastRow - 1, 1)
    .getValues()
    .map(function (row) {
      return parseInt(row[0], 10);
    })
    .filter(function (n) {
      return !isNaN(n);
    });
  if (numbers.length === 0) return 1;
  return Math.max.apply(null, numbers) + 1;
}

function pad4(n) {
  return String(n).padStart(4, "0");
}

function randomSlug_() {
  return Utilities.getUuid().replace(/-/g, "").slice(0, 10);
}

function rowToMember_(row) {
  return {
    memberNumber: parseInt(row[COL.MEMBER_NUMBER], 10),
    communityId: String(row[COL.COMMUNITY_ID]),
    memberDisplay: pad4(parseInt(row[COL.MEMBER_NUMBER], 10)),
    joinDate: String(row[COL.CREATED_AT]),
    inviteSlug: String(row[COL.INVITE_SLUG]),
    fullName: String(row[COL.FULL_NAME]),
    email: String(row[COL.EMAIL]),
    phoneE164: String(row[COL.PHONE]),
    country: String(row[COL.COUNTRY]),
    city: String(row[COL.CITY]),
    xUsername: String(row[COL.X_USERNAME]),
  };
}

function findRowByEmail_(sh, email) {
  const target = email.toLowerCase().trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return null;
  const emails = sh.getRange(2, COL.EMAIL + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase().trim() === target) {
      return sh.getRange(i + 2, 1, 1, COL.USER_AGENT + 1).getValues()[0];
    }
  }
  return null;
}

function doGet(e) {
  if (!checkToken(e)) return unauthorized();

  const email = e.parameter.email ? String(e.parameter.email) : "";
  if (!email) {
    return jsonOutput({ ok: false, error: "email required" });
  }

  const sh = getSheet_();
  const row = findRowByEmail_(sh, email);
  if (!row) {
    return jsonOutput({ ok: false, error: "not found" });
  }

  return jsonOutput({ ok: true, member: rowToMember_(row) });
}

function doPost(e) {
  if (!checkToken(e)) return unauthorized();

  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const email = (body.email || "").toLowerCase().trim();
    if (!email) {
      return jsonOutput({ ok: false, error: "email required" });
    }

    const sh = getSheet_();
    if (findRowByEmail_(sh, email)) {
      return jsonOutput({ ok: false, error: "This email is already registered." });
    }

    const memberNumber = nextMemberNumber_(sh);
    const communityId = "DEV-" + pad4(memberNumber);
    const inviteSlug = randomSlug_();
    const createdAt = new Date().toISOString();

    sh.appendRow([
      createdAt,
      body.fullName || "",
      email,
      body.phoneE164 || "",
      body.country || "",
      body.city || "",
      body.xUsername || "",
      body.xProfileLink || "",
      body.followedX === true,
      body.joinedCommunity === true,
      memberNumber,
      communityId,
      inviteSlug,
      body.sourceIp || "",
      body.userAgent || "",
    ]);

    return jsonOutput({
      ok: true,
      member: {
        memberNumber: memberNumber,
        communityId: communityId,
        memberDisplay: pad4(memberNumber),
        joinDate: createdAt,
        inviteSlug: inviteSlug,
        fullName: body.fullName || "",
        email: email,
        phoneE164: body.phoneE164 || "",
        country: body.country || "",
        city: body.city || "",
        xUsername: body.xUsername || "",
      },
    });
  } catch (err) {
    return jsonOutput({ ok: false, error: "bad_request" });
  }
}
