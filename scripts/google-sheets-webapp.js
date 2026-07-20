/**
 * BetterDev — Google Apps Script (bound to your spreadsheet).
 * Deploy as Web app: Execute as Me, Who has access: Anyone.
 * Protect with API_TOKEN query param (set in .env.local on Next.js).
 *
 * Sheet tab: submissions
 * Columns (row 1 headers):
 * created_at | full_name | email | phone_e164 | country | city | x_username |
 * x_profile_link | followed_x | joined_community | member_number | community_id |
 * invite_slug | referred_by_invite_slug | source_ip | user_agent | reputation
 *
 * Sheet tab: checkins
 * created_at | meetup_id | community_id | email | wallet | attendance_tx | reputation_awarded
 *
 * Sheet tab: events
 * created_at | slug | name | city | metadata_uri | tx_hash
 *
 * Sheet tab: auth_codes (email login OTP)
 * created_at | email | code | expires_at | used
 */
const SHEET_NAME = "submissions";
const CHECKINS_SHEET_NAME = "checkins";
const EVENTS_SHEET_NAME = "events";
const AUTH_CODES_SHEET_NAME = "auth_codes";
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
  REFERRED_BY_INVITE_SLUG: 13,
  SOURCE_IP: 14,
  USER_AGENT: 15,
  REPUTATION: 16,
};

const CHECKIN_COL = {
  CREATED_AT: 0,
  MEETUP_ID: 1,
  COMMUNITY_ID: 2,
  EMAIL: 3,
  WALLET: 4,
  ATTENDANCE_TX: 5,
  REPUTATION_AWARDED: 6,
};

const EVENT_COL = {
  CREATED_AT: 0,
  SLUG: 1,
  NAME: 2,
  CITY: 3,
  METADATA_URI: 4,
  TX_HASH: 5,
};

const AUTH_CODE_COL = {
  CREATED_AT: 0,
  EMAIL: 1,
  CODE: 2,
  EXPIRES_AT: 3,
  USED: 4,
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
      "referred_by_invite_slug",
      "source_ip",
      "user_agent",
      "reputation",
    ]);
  } else {
    ensureSubmissionsSchema_(sh);
  }
  return sh;
}

function ensureSubmissionsSchema_(sh) {
  const lastCol = Math.max(sh.getLastColumn(), COL.REPUTATION + 1);
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  if (String(headers[COL.REPUTATION] || "").trim().toLowerCase() !== "reputation") {
    sh.getRange(1, COL.REPUTATION + 1).setValue("reputation");
    const lastRow = sh.getLastRow();
    if (lastRow > 1) {
      sh.getRange(2, COL.REPUTATION + 1, lastRow, 1).setValue(0);
    }
  }
}

function getCheckinsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CHECKINS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CHECKINS_SHEET_NAME);
    sh.appendRow([
      "created_at",
      "meetup_id",
      "community_id",
      "email",
      "wallet",
      "attendance_tx",
      "reputation_awarded",
    ]);
  }
  return sh;
}

function getEventsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(EVENTS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(EVENTS_SHEET_NAME);
    sh.appendRow(["created_at", "slug", "name", "city", "metadata_uri", "tx_hash"]);
  }
  return sh;
}

function getAuthCodesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(AUTH_CODES_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(AUTH_CODES_SHEET_NAME);
    sh.appendRow(["created_at", "email", "code", "expires_at", "used"]);
  }
  return sh;
}

function invalidateAuthCodesForEmail_(sh, email) {
  const target = email.toLowerCase().trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return;
  const rows = sh.getRange(2, 1, lastRow - 1, AUTH_CODE_COL.USED + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[AUTH_CODE_COL.EMAIL]).toLowerCase().trim() === target &&
      row[AUTH_CODE_COL.USED] !== true &&
      String(row[AUTH_CODE_COL.USED]).toLowerCase() !== "true"
    ) {
      sh.getRange(i + 2, AUTH_CODE_COL.USED + 1).setValue(true);
    }
  }
}

function handleAuthCodeStore_(body) {
  const email = (body.email || "").toLowerCase().trim();
  const code = String(body.code || "").trim();
  const expiresAt = String(body.expiresAt || "").trim();
  if (!email || !code || !expiresAt) {
    return jsonOutput({ ok: false, error: "email, code, and expiresAt required" });
  }
  if (!/^\d{6}$/.test(code)) {
    return jsonOutput({ ok: false, error: "invalid code format" });
  }

  const sh = getAuthCodesSheet_();
  invalidateAuthCodesForEmail_(sh, email);
  sh.appendRow([new Date().toISOString(), email, code, expiresAt, false]);
  return jsonOutput({ ok: true, stored: true });
}

function handleAuthCodeVerify_(body) {
  const email = (body.email || "").toLowerCase().trim();
  const code = String(body.code || "").trim();
  if (!email || !code) {
    return jsonOutput({ ok: false, error: "email and code required" });
  }

  const sh = getAuthCodesSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, valid: false });
  }

  const now = Date.now();
  const rows = sh.getRange(2, 1, lastRow - 1, AUTH_CODE_COL.USED + 1).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (String(row[AUTH_CODE_COL.EMAIL]).toLowerCase().trim() !== email) continue;
    if (String(row[AUTH_CODE_COL.CODE]).trim() !== code) continue;
    if (row[AUTH_CODE_COL.USED] === true || String(row[AUTH_CODE_COL.USED]).toLowerCase() === "true") {
      continue;
    }
    const expiresAt = Date.parse(String(row[AUTH_CODE_COL.EXPIRES_AT]));
    if (!Number.isFinite(expiresAt) || now > expiresAt) {
      continue;
    }
    sh.getRange(i + 2, AUTH_CODE_COL.USED + 1).setValue(true);
    return jsonOutput({ ok: true, valid: true });
  }

  return jsonOutput({ ok: true, valid: false });
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
    referredByInviteSlug: String(row[COL.REFERRED_BY_INVITE_SLUG] || ""),
    fullName: String(row[COL.FULL_NAME]),
    email: String(row[COL.EMAIL]),
    phoneE164: String(row[COL.PHONE]),
    country: String(row[COL.COUNTRY]),
    city: String(row[COL.CITY]),
    xUsername: String(row[COL.X_USERNAME]),
    reputation: parseInt(row[COL.REPUTATION], 10) || 0,
  };
}

function findRowByEmail_(sh, email) {
  const target = email.toLowerCase().trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return null;
  const emails = sh.getRange(2, COL.EMAIL + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase().trim() === target) {
      return sh.getRange(i + 2, 1, 1, COL.REPUTATION + 1).getValues()[0];
    }
  }
  return null;
}

function findRowByCommunityId_(sh, communityId) {
  const target = String(communityId).trim().toUpperCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return null;
  const ids = sh.getRange(2, COL.COMMUNITY_ID + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim().toUpperCase() === target) {
      return sh.getRange(i + 2, 1, 1, COL.REPUTATION + 1).getValues()[0];
    }
  }
  return null;
}

function findCommunityIdRowIndex_(sh, communityId) {
  const target = String(communityId).trim().toUpperCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const ids = sh.getRange(2, COL.COMMUNITY_ID + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim().toUpperCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function syncMemberReputation_(communityId, totalReputation) {
  if (totalReputation === undefined || totalReputation === null || totalReputation === "") {
    return;
  }
  const sh = getSheet_();
  const rowIndex = findCommunityIdRowIndex_(sh, communityId);
  if (rowIndex === -1) return;
  sh.getRange(rowIndex, COL.REPUTATION + 1).setValue(parseInt(totalReputation, 10) || 0);
}

function findCheckin_(sh, email, meetupId) {
  const targetEmail = email.toLowerCase().trim();
  const targetMeetup = String(meetupId).trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return null;
  const rows = sh.getRange(2, 1, lastRow - 1, CHECKIN_COL.REPUTATION_AWARDED + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[CHECKIN_COL.EMAIL]).toLowerCase().trim() === targetEmail &&
      String(row[CHECKIN_COL.MEETUP_ID]).trim() === targetMeetup
    ) {
      return row;
    }
  }
  return null;
}

function findCheckinByCommunityId_(sh, communityId, meetupId) {
  const targetCommunityId = String(communityId).trim().toUpperCase();
  const targetMeetup = String(meetupId).trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return null;
  const rows = sh.getRange(2, 1, lastRow - 1, CHECKIN_COL.REPUTATION_AWARDED + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[CHECKIN_COL.COMMUNITY_ID]).trim().toUpperCase() === targetCommunityId &&
      String(row[CHECKIN_COL.MEETUP_ID]).trim() === targetMeetup
    ) {
      return row;
    }
  }
  return null;
}

function handleCheckinStatus_(e) {
  const email = e.parameter.email ? String(e.parameter.email) : "";
  const communityId = e.parameter.communityId ? String(e.parameter.communityId) : "";
  const meetupId = e.parameter.meetupId ? String(e.parameter.meetupId) : "";
  if (!meetupId) {
    return jsonOutput({ ok: false, error: "meetupId required" });
  }
  if (!email && !communityId) {
    return jsonOutput({ ok: false, error: "email or communityId required" });
  }

  const sh = getCheckinsSheet_();
  const row = communityId
    ? findCheckinByCommunityId_(sh, communityId, meetupId)
    : findCheckin_(sh, email, meetupId);
  if (!row) {
    return jsonOutput({ ok: true, checkedIn: false });
  }

  return jsonOutput({
    ok: true,
    checkedIn: true,
    attendanceTx: String(row[CHECKIN_COL.ATTENDANCE_TX] || ""),
    communityId: String(row[CHECKIN_COL.COMMUNITY_ID] || ""),
    reputationAwarded: parseInt(row[CHECKIN_COL.REPUTATION_AWARDED], 10) || 0,
  });
}

function rowToEvent_(row) {
  return {
    createdAt: String(row[EVENT_COL.CREATED_AT] || ""),
    slug: String(row[EVENT_COL.SLUG] || ""),
    name: String(row[EVENT_COL.NAME] || ""),
    city: String(row[EVENT_COL.CITY] || ""),
    metadataUri: String(row[EVENT_COL.METADATA_URI] || ""),
    txHash: String(row[EVENT_COL.TX_HASH] || ""),
  };
}

function findEventRowIndex_(sh, slug) {
  const target = String(slug).trim().toLowerCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const slugs = sh.getRange(2, EVENT_COL.SLUG + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < slugs.length; i++) {
    if (String(slugs[i][0]).trim().toLowerCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function handleEventGet_(e) {
  const slug = e.parameter.slug ? String(e.parameter.slug) : "";
  if (!slug) {
    return jsonOutput({ ok: false, error: "slug required" });
  }

  const sh = getEventsSheet_();
  const rowIndex = findEventRowIndex_(sh, slug);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "not found" });
  }

  const row = sh.getRange(rowIndex, 1, 1, EVENT_COL.TX_HASH + 1).getValues()[0];
  return jsonOutput({ ok: true, event: rowToEvent_(row) });
}

function handleEventPost_(body) {
  const slug = String(body.slug || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const city = String(body.city || "").trim();
  const metadataUri = String(body.metadataUri || "").trim();
  const txHash = String(body.txHash || "").trim();

  if (!slug || !name || !city) {
    return jsonOutput({ ok: false, error: "slug, name, and city required" });
  }

  const sh = getEventsSheet_();
  const rowIndex = findEventRowIndex_(sh, slug);
  const now = new Date().toISOString();

  if (rowIndex === -1) {
    sh.appendRow([now, slug, name, city, metadataUri, txHash]);
    return jsonOutput({
      ok: true,
      created: true,
      event: { createdAt: now, slug: slug, name: name, city: city, metadataUri: metadataUri, txHash: txHash },
    });
  }

  const existing = sh.getRange(rowIndex, 1, 1, EVENT_COL.TX_HASH + 1).getValues()[0];
  const createdAt = String(existing[EVENT_COL.CREATED_AT] || now);
  sh.getRange(rowIndex, 1, 1, EVENT_COL.TX_HASH + 1).setValues([
    [createdAt, slug, name, city, metadataUri || String(existing[EVENT_COL.METADATA_URI] || ""), txHash || String(existing[EVENT_COL.TX_HASH] || "")],
  ]);

  return jsonOutput({
    ok: true,
    created: false,
    event: {
      createdAt: createdAt,
      slug: slug,
      name: name,
      city: city,
      metadataUri: metadataUri || String(existing[EVENT_COL.METADATA_URI] || ""),
      txHash: txHash || String(existing[EVENT_COL.TX_HASH] || ""),
    },
  });
}

function handleRegisterPost_(body) {
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
    body.referredByInviteSlug || "",
    body.sourceIp || "",
    body.userAgent || "",
    0,
  ]);

  return jsonOutput({
    ok: true,
    member: {
      memberNumber: memberNumber,
      communityId: communityId,
      memberDisplay: pad4(memberNumber),
      joinDate: createdAt,
      inviteSlug: inviteSlug,
      referredByInviteSlug: body.referredByInviteSlug || "",
      fullName: body.fullName || "",
      email: email,
      phoneE164: body.phoneE164 || "",
      country: body.country || "",
      city: body.city || "",
      xUsername: body.xUsername || "",
      reputation: 0,
    },
  });
}

function handleCheckinPost_(body) {
  const email = (body.email || "").toLowerCase().trim();
  const meetupId = String(body.meetupId || "").trim();
  const communityId = String(body.communityId || "").trim().toUpperCase();
  const wallet = String(body.wallet || "").trim();
  if (!meetupId || !communityId) {
    return jsonOutput({ ok: false, error: "meetupId and communityId required" });
  }

  if (body.totalReputation !== undefined && body.totalReputation !== null && body.totalReputation !== "") {
    syncMemberReputation_(communityId, body.totalReputation);
  }

  const sh = getCheckinsSheet_();
  const existing = findCheckinByCommunityId_(sh, communityId, meetupId);
  if (existing) {
    return jsonOutput({
      ok: true,
      alreadyRecorded: true,
      attendanceTx: String(existing[CHECKIN_COL.ATTENDANCE_TX] || ""),
    });
  }

  sh.appendRow([
    new Date().toISOString(),
    meetupId,
    communityId,
    email,
    wallet,
    body.attendanceTx || "",
    body.reputationAwarded || 0,
  ]);

  return jsonOutput({ ok: true, alreadyRecorded: false });
}

function doGet(e) {
  if (!checkToken(e)) return unauthorized();

  const action = e.parameter.action ? String(e.parameter.action) : "";
  if (action === "checkinStatus") {
    return handleCheckinStatus_(e);
  }
  if (action === "event") {
    return handleEventGet_(e);
  }

  const email = e.parameter.email ? String(e.parameter.email) : "";
  const communityId = e.parameter.communityId ? String(e.parameter.communityId) : "";
  if (!email && !communityId) {
    return jsonOutput({ ok: false, error: "email or communityId required" });
  }

  const sh = getSheet_();
  const row = communityId
    ? findRowByCommunityId_(sh, communityId)
    : findRowByEmail_(sh, email);
  if (!row) {
    return jsonOutput({ ok: false, error: "not found" });
  }

  return jsonOutput({ ok: true, member: rowToMember_(row) });
}

function doPost(e) {
  if (!checkToken(e)) return unauthorized();

  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action ? String(body.action) : "register";
    if (action === "checkin") {
      return handleCheckinPost_(body);
    }
    if (action === "event") {
      return handleEventPost_(body);
    }
    if (action === "authCodeStore") {
      return handleAuthCodeStore_(body);
    }
    if (action === "authCodeVerify") {
      return handleAuthCodeVerify_(body);
    }
    return handleRegisterPost_(body);
  } catch (err) {
    return jsonOutput({ ok: false, error: "bad_request" });
  }
}
