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
 * created_at | slug | name | city | metadata_uri | tx_hash | organizer_id | country
 *
 * Sheet tab: organizers (city co-leads)
 * created_at | community_id | email | full_name | organizer_id | organizer_code | city | country |
 * status | organizer_reputation | events_hosted | x_username | bio | approved_at
 *
 * Sheet tab: auth_codes (email login OTP)
 * created_at | email | code | expires_at | used
 *
 * Sheet tab: builder_circles
 * created_at | meetup_id | organizer_id | city | attendee_count | group_size | vrf_seed | vrf_fulfilled | circles_json | status
 *
 * Sheet tab: meetup_rsvps
 * created_at | meetup_id | community_id | email | full_name | city | country | x_username
 */
const SHEET_NAME = "submissions";
const CHECKINS_SHEET_NAME = "checkins";
const EVENTS_SHEET_NAME = "events";
const ORGANIZERS_SHEET_NAME = "organizers";
const AUTH_CODES_SHEET_NAME = "auth_codes";
const BUILDER_CIRCLES_SHEET_NAME = "builder_circles";
const MEETUP_RSVPS_SHEET_NAME = "meetup_rsvps";
const API_TOKEN = "freje!better_dev121518";

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
  ORGANIZER_ID: 6,
  COUNTRY: 7,
};

const ORGANIZER_COL = {
  CREATED_AT: 0,
  COMMUNITY_ID: 1,
  EMAIL: 2,
  FULL_NAME: 3,
  ORGANIZER_ID: 4,
  ORGANIZER_CODE: 5,
  CITY: 6,
  COUNTRY: 7,
  STATUS: 8,
  ORGANIZER_REPUTATION: 9,
  EVENTS_HOSTED: 10,
  X_USERNAME: 11,
  BIO: 12,
  APPROVED_AT: 13,
  CODE_VRF_FULFILLED: 14,
  CODE_VRF_SEED: 15,
  ORGANIZER_SECRET: 16,
};

const AUTH_CODE_COL = {
  CREATED_AT: 0,
  EMAIL: 1,
  CODE: 2,
  EXPIRES_AT: 3,
  USED: 4,
};

const BUILDER_CIRCLE_COL = {
  CREATED_AT: 0,
  MEETUP_ID: 1,
  ORGANIZER_ID: 2,
  CITY: 3,
  ATTENDEE_COUNT: 4,
  GROUP_SIZE: 5,
  VRF_SEED: 6,
  VRF_FULFILLED: 7,
  CIRCLES_JSON: 8,
  STATUS: 9,
};

const RSVP_COL = {
  CREATED_AT: 0,
  MEETUP_ID: 1,
  COMMUNITY_ID: 2,
  EMAIL: 3,
  FULL_NAME: 4,
  CITY: 5,
  COUNTRY: 6,
  X_USERNAME: 7,
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
    sh.appendRow([
      "created_at",
      "slug",
      "name",
      "city",
      "metadata_uri",
      "tx_hash",
      "organizer_id",
      "country",
    ]);
  } else {
    ensureEventsSchema_(sh);
  }
  return sh;
}

function ensureEventsSchema_(sh) {
  const headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), EVENT_COL.COUNTRY + 1)).getValues()[0];
  if (String(headers[EVENT_COL.ORGANIZER_ID] || "").trim().toLowerCase() !== "organizer_id") {
    sh.getRange(1, EVENT_COL.ORGANIZER_ID + 1).setValue("organizer_id");
  }
  if (String(headers[EVENT_COL.COUNTRY] || "").trim().toLowerCase() !== "country") {
    sh.getRange(1, EVENT_COL.COUNTRY + 1).setValue("country");
  }
}

function getOrganizersSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ORGANIZERS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(ORGANIZERS_SHEET_NAME);
    sh.appendRow([
      "created_at",
      "community_id",
      "email",
      "full_name",
      "organizer_id",
      "organizer_code",
      "city",
      "country",
      "status",
      "organizer_reputation",
      "events_hosted",
      "x_username",
      "bio",
      "approved_at",
      "code_vrf_fulfilled",
      "code_vrf_seed",
      "organizer_secret",
    ]);
  } else {
    ensureOrganizersSchema_(sh);
  }
  return sh;
}

function ensureOrganizersSchema_(sh) {
  const headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), ORGANIZER_COL.ORGANIZER_SECRET + 1)).getValues()[0];
  if (String(headers[ORGANIZER_COL.CODE_VRF_FULFILLED] || "").trim().toLowerCase() !== "code_vrf_fulfilled") {
    sh.getRange(1, ORGANIZER_COL.CODE_VRF_FULFILLED + 1).setValue("code_vrf_fulfilled");
  }
  if (String(headers[ORGANIZER_COL.CODE_VRF_SEED] || "").trim().toLowerCase() !== "code_vrf_seed") {
    sh.getRange(1, ORGANIZER_COL.CODE_VRF_SEED + 1).setValue("code_vrf_seed");
  }
  if (String(headers[ORGANIZER_COL.ORGANIZER_SECRET] || "").trim().toLowerCase() !== "organizer_secret") {
    sh.getRange(1, ORGANIZER_COL.ORGANIZER_SECRET + 1).setValue("organizer_secret");
  }
}

function organizerRowWidth_() {
  return ORGANIZER_COL.ORGANIZER_SECRET + 1;
}

function generateOrganizerSecret_() {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  var out = "org_";
  for (var i = 0; i < 40; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function nextOrganizerNumber_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return 1;
  const ids = sh.getRange(2, ORGANIZER_COL.ORGANIZER_ID + 1, lastRow - 1, 1).getValues();
  var maxNum = 0;
  for (var i = 0; i < ids.length; i++) {
    const match = String(ids[i][0]).trim().match(/^ORG-(\d+)$/i);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1], 10));
    }
  }
  return maxNum + 1;
}

function randomOrganizerCode_() {
  return "PENDING-VRF";
}

function findOrganizerRowIndexBySecret_(sh, secret) {
  const target = String(secret || "").trim();
  if (!target) return -1;
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const width = organizerRowWidth_();
  const rows = sh.getRange(2, 1, lastRow - 1, width).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][ORGANIZER_COL.ORGANIZER_SECRET] || "").trim() === target) {
      return i + 2;
    }
  }
  return -1;
}

function rowToOrganizer_(row, includePrivate) {
  const organizer = {
    createdAt: String(row[ORGANIZER_COL.CREATED_AT] || ""),
    communityId: String(row[ORGANIZER_COL.COMMUNITY_ID] || "").trim().toUpperCase(),
    fullName: String(row[ORGANIZER_COL.FULL_NAME] || ""),
    organizerId: String(row[ORGANIZER_COL.ORGANIZER_ID] || "").trim().toUpperCase(),
    organizerCode: String(row[ORGANIZER_COL.ORGANIZER_CODE] || ""),
    city: String(row[ORGANIZER_COL.CITY] || ""),
    country: String(row[ORGANIZER_COL.COUNTRY] || ""),
    status: String(row[ORGANIZER_COL.STATUS] || "pending").trim().toLowerCase(),
    organizerReputation: parseInt(row[ORGANIZER_COL.ORGANIZER_REPUTATION], 10) || 0,
    eventsHosted: parseInt(row[ORGANIZER_COL.EVENTS_HOSTED], 10) || 0,
    xUsername: String(row[ORGANIZER_COL.X_USERNAME] || ""),
    bio: String(row[ORGANIZER_COL.BIO] || ""),
    approvedAt: String(row[ORGANIZER_COL.APPROVED_AT] || ""),
    codeVrfFulfilled:
      row[ORGANIZER_COL.CODE_VRF_FULFILLED] === true ||
      String(row[ORGANIZER_COL.CODE_VRF_FULFILLED]).toLowerCase() === "true",
    codeVrfSeed: String(row[ORGANIZER_COL.CODE_VRF_SEED] || ""),
  };
  if (includePrivate) {
    organizer.email = String(row[ORGANIZER_COL.EMAIL] || "").toLowerCase().trim();
  }
  return organizer;
}

function findOrganizerRowIndexByEmail_(sh, email) {
  const target = String(email).toLowerCase().trim();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const rows = sh.getRange(2, 1, lastRow - 1, ORGANIZER_COL.APPROVED_AT + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][ORGANIZER_COL.EMAIL]).toLowerCase().trim() === target) {
      return i + 2;
    }
  }
  return -1;
}

function findOrganizerRowIndexByOrganizerId_(sh, organizerId) {
  const target = String(organizerId).trim().toUpperCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const rows = sh.getRange(2, 1, lastRow - 1, ORGANIZER_COL.APPROVED_AT + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][ORGANIZER_COL.ORGANIZER_ID]).trim().toUpperCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function handleOrganizersList_(e) {
  const statusFilter = e.parameter.status ? String(e.parameter.status).trim().toLowerCase() : "active";
  const sh = getOrganizersSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, organizers: [] });
  }

  const rows = sh.getRange(2, 1, lastRow - 1, ORGANIZER_COL.APPROVED_AT + 1).getValues();
  const organizers = [];
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    const status = String(row[ORGANIZER_COL.STATUS] || "pending").trim().toLowerCase();
    if (statusFilter && status !== statusFilter) continue;
    organizers.push(rowToOrganizer_(row, false));
  }

  return jsonOutput({ ok: true, organizers: organizers });
}

function handleOrganizerGet_(e) {
  const email = e.parameter.email ? String(e.parameter.email) : "";
  const organizerId = e.parameter.organizerId ? String(e.parameter.organizerId) : "";
  const communityId = e.parameter.communityId ? String(e.parameter.communityId) : "";
  if (!email && !organizerId && !communityId) {
    return jsonOutput({ ok: false, error: "email, organizerId, or communityId required" });
  }

  const sh = getOrganizersSheet_();
  var rowIndex = -1;
  if (email) {
    rowIndex = findOrganizerRowIndexByEmail_(sh, email);
  } else if (organizerId) {
    rowIndex = findOrganizerRowIndexByOrganizerId_(sh, organizerId);
  } else {
    const targetCommunityId = communityId.trim().toUpperCase();
    const lastRow = sh.getLastRow();
    if (lastRow > 1) {
      const rows = sh.getRange(2, 1, lastRow - 1, ORGANIZER_COL.APPROVED_AT + 1).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][ORGANIZER_COL.COMMUNITY_ID]).trim().toUpperCase() === targetCommunityId) {
          rowIndex = i + 2;
          break;
        }
      }
    }
  }

  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "not found" });
  }

  const row = sh.getRange(rowIndex, 1, 1, ORGANIZER_COL.APPROVED_AT + 1).getValues()[0];
  const includePrivate = email ? true : false;
  return jsonOutput({ ok: true, organizer: rowToOrganizer_(row, includePrivate) });
}

function handleOrganizerEventsGet_(e) {
  const organizerId = e.parameter.organizerId ? String(e.parameter.organizerId).trim().toUpperCase() : "";
  if (!organizerId) {
    return jsonOutput({ ok: false, error: "organizerId required" });
  }

  const sh = getEventsSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, events: [] });
  }

  const rows = sh.getRange(2, 1, lastRow - 1, EVENT_COL.COUNTRY + 1).getValues();
  const events = [];
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[EVENT_COL.ORGANIZER_ID] || "").trim().toUpperCase() !== organizerId) continue;
    events.push(rowToEvent_(row));
  }

  return jsonOutput({ ok: true, events: events });
}

function handleOrganizerApply_(body) {
  const email = (body.email || "").toLowerCase().trim();
  const communityId = String(body.communityId || "").trim().toUpperCase();
  const fullName = String(body.fullName || "").trim();
  const city = String(body.city || "").trim();
  const country = String(body.country || "").trim();
  const xUsername = String(body.xUsername || "").trim();
  const bio = String(body.bio || "").trim();

  if (!email || !communityId || !fullName || !city || !country) {
    return jsonOutput({ ok: false, error: "email, communityId, fullName, city, and country required" });
  }

  const sh = getOrganizersSheet_();
  const existingIndex = findOrganizerRowIndexByEmail_(sh, email);
  if (existingIndex !== -1) {
    const existing = sh.getRange(existingIndex, 1, 1, organizerRowWidth_()).getValues()[0];
    return jsonOutput({
      ok: true,
      created: false,
      organizer: rowToOrganizer_(existing, true),
    });
  }

  const organizerNumber = nextOrganizerNumber_(sh);
  const organizerId = "ORG-" + pad4(organizerNumber);
  const organizerCode = randomOrganizerCode_();
  const createdAt = new Date().toISOString();

  sh.appendRow([
    createdAt,
    communityId,
    email,
    fullName,
    organizerId,
    organizerCode,
    city,
    country,
    "pending",
    0,
    0,
    xUsername,
    bio,
    "",
    "",
    "",
    "",
  ]);

  return jsonOutput({
    ok: true,
    created: true,
    organizer: {
      createdAt: createdAt,
      communityId: communityId,
      email: email,
      fullName: fullName,
      organizerId: organizerId,
      organizerCode: organizerCode,
      city: city,
      country: country,
      status: "pending",
      organizerReputation: 0,
      eventsHosted: 0,
      xUsername: xUsername,
      bio: bio,
      approvedAt: "",
    },
  });
}

function handleOrganizerActivate_(body) {
  const organizerId = String(body.organizerId || "").trim().toUpperCase();
  if (!organizerId) {
    return jsonOutput({ ok: false, error: "organizerId required" });
  }

  const sh = getOrganizersSheet_();
  const rowIndex = findOrganizerRowIndexByOrganizerId_(sh, organizerId);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "organizer not found" });
  }

  const width = organizerRowWidth_();
  const row = sh.getRange(rowIndex, 1, 1, width).getValues()[0];
  var secret = String(row[ORGANIZER_COL.ORGANIZER_SECRET] || "").trim();
  if (!secret) {
    secret = generateOrganizerSecret_();
    sh.getRange(rowIndex, ORGANIZER_COL.ORGANIZER_SECRET + 1).setValue(secret);
  }

  sh.getRange(rowIndex, ORGANIZER_COL.STATUS + 1).setValue("active");
  if (!String(row[ORGANIZER_COL.APPROVED_AT] || "").trim()) {
    sh.getRange(rowIndex, ORGANIZER_COL.APPROVED_AT + 1).setValue(new Date().toISOString());
  }

  const updatedRow = sh.getRange(rowIndex, 1, 1, width).getValues()[0];
  return jsonOutput({
    ok: true,
    organizer: rowToOrganizer_(updatedRow, true),
    organizerSecret: secret,
  });
}

function handleOrganizerBySecretGet_(e) {
  const secret = String(e.parameter.secret || "").trim();
  if (!secret) {
    return jsonOutput({ ok: false, error: "secret required" });
  }

  const sh = getOrganizersSheet_();
  const rowIndex = findOrganizerRowIndexBySecret_(sh, secret);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "invalid organizer key" });
  }

  const row = sh.getRange(rowIndex, 1, 1, organizerRowWidth_()).getValues()[0];
  const status = String(row[ORGANIZER_COL.STATUS] || "pending").trim().toLowerCase();
  if (status !== "active") {
    return jsonOutput({ ok: false, error: "organizer not active" });
  }

  return jsonOutput({ ok: true, organizer: rowToOrganizer_(row, true) });
}

function handleOrganizerEventCreated_(body) {
  const organizerId = String(body.organizerId || "").trim().toUpperCase();
  const reputationDelta = parseInt(body.reputationDelta, 10) || 10;
  const incrementEventsHosted = body.incrementEventsHosted !== false;
  if (!organizerId) {
    return jsonOutput({ ok: false, error: "organizerId required" });
  }

  const sh = getOrganizersSheet_();
  const rowIndex = findOrganizerRowIndexByOrganizerId_(sh, organizerId);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "organizer not found" });
  }

  const row = sh.getRange(rowIndex, 1, 1, ORGANIZER_COL.APPROVED_AT + 1).getValues()[0];
  const eventsHosted =
    (parseInt(row[ORGANIZER_COL.EVENTS_HOSTED], 10) || 0) + (incrementEventsHosted ? 1 : 0);
  const organizerReputation = (parseInt(row[ORGANIZER_COL.ORGANIZER_REPUTATION], 10) || 0) + reputationDelta;
  sh.getRange(rowIndex, ORGANIZER_COL.EVENTS_HOSTED + 1).setValue(eventsHosted);
  sh.getRange(rowIndex, ORGANIZER_COL.ORGANIZER_REPUTATION + 1).setValue(organizerReputation);

  return jsonOutput({
    ok: true,
    eventsHosted: eventsHosted,
    organizerReputation: organizerReputation,
  });
}

function handleOrganizerCodeUpdate_(body) {
  const organizerId = String(body.organizerId || "").trim().toUpperCase();
  const organizerCode = String(body.organizerCode || "").trim().toUpperCase();
  const vrfSeed = String(body.vrfSeed || "").trim();
  const vrfFulfilled = body.vrfFulfilled === true;

  if (!organizerId || !organizerCode) {
    return jsonOutput({ ok: false, error: "organizerId and organizerCode required" });
  }

  const sh = getOrganizersSheet_();
  const rowIndex = findOrganizerRowIndexByOrganizerId_(sh, organizerId);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "organizer not found" });
  }

  sh.getRange(rowIndex, ORGANIZER_COL.ORGANIZER_CODE + 1).setValue(organizerCode);
  sh.getRange(rowIndex, ORGANIZER_COL.CODE_VRF_FULFILLED + 1).setValue(vrfFulfilled);
  sh.getRange(rowIndex, ORGANIZER_COL.CODE_VRF_SEED + 1).setValue(vrfSeed);

  const row = sh.getRange(rowIndex, 1, 1, organizerRowWidth_()).getValues()[0];
  return jsonOutput({ ok: true, organizer: rowToOrganizer_(row, true) });
}

function citiesMatch_(a, b) {
  return String(a || "")
    .trim()
    .toLowerCase() ===
    String(b || "")
      .trim()
      .toLowerCase();
}

function getMeetupRsvpsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(MEETUP_RSVPS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(MEETUP_RSVPS_SHEET_NAME);
    sh.appendRow([
      "created_at",
      "meetup_id",
      "community_id",
      "email",
      "full_name",
      "city",
      "country",
      "x_username",
    ]);
  }
  return sh;
}

function memberRowToParticipant_(memberRow, meetupId) {
  const member = rowToMember_(memberRow);
  return {
    createdAt: member.joinDate,
    meetupId: meetupId || "",
    communityId: member.communityId.trim().toUpperCase(),
    email: member.email,
    fullName: member.fullName,
    city: member.city,
    country: member.country,
    xUsername: member.xUsername,
  };
}

function rowToMeetupRsvpParticipant_(row, meetupId) {
  return {
    createdAt: String(row[RSVP_COL.CREATED_AT] || ""),
    meetupId: meetupId || String(row[RSVP_COL.MEETUP_ID] || "").trim(),
    communityId: String(row[RSVP_COL.COMMUNITY_ID] || "")
      .trim()
      .toUpperCase(),
    email: String(row[RSVP_COL.EMAIL] || ""),
    fullName: String(row[RSVP_COL.FULL_NAME] || ""),
    city: String(row[RSVP_COL.CITY] || ""),
    country: String(row[RSVP_COL.COUNTRY] || ""),
    xUsername: String(row[RSVP_COL.X_USERNAME] || ""),
  };
}

function findMeetupRsvpRowIndex_(sh, meetupId, communityId) {
  const targetMeetup = String(meetupId || "")
    .trim()
    .toLowerCase();
  const targetCommunity = String(communityId || "")
    .trim()
    .toUpperCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const rows = sh.getRange(2, 1, lastRow - 1, RSVP_COL.X_USERNAME + 1).getValues();
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[RSVP_COL.MEETUP_ID])
        .trim()
        .toLowerCase() === targetMeetup &&
      String(row[RSVP_COL.COMMUNITY_ID])
        .trim()
        .toUpperCase() === targetCommunity
    ) {
      return i + 2;
    }
  }
  return -1;
}

function getBuilderCirclesSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(BUILDER_CIRCLES_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(BUILDER_CIRCLES_SHEET_NAME);
    sh.appendRow([
      "created_at",
      "meetup_id",
      "organizer_id",
      "city",
      "attendee_count",
      "group_size",
      "vrf_seed",
      "vrf_fulfilled",
      "circles_json",
      "status",
    ]);
  }
  return sh;
}

function findBuilderCircleRowIndex_(sh, meetupId) {
  const target = String(meetupId).trim().toLowerCase();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return -1;
  const slugs = sh.getRange(2, BUILDER_CIRCLE_COL.MEETUP_ID + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < slugs.length; i++) {
    if (String(slugs[i][0]).trim().toLowerCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function rowToBuilderCircleAssignment_(row) {
  var circles = [];
  try {
    const parsed = JSON.parse(String(row[BUILDER_CIRCLE_COL.CIRCLES_JSON] || "{}"));
    circles = parsed.circles || [];
  } catch (err) {
    circles = [];
  }
  return {
    createdAt: String(row[BUILDER_CIRCLE_COL.CREATED_AT] || ""),
    meetupId: String(row[BUILDER_CIRCLE_COL.MEETUP_ID] || ""),
    organizerId: String(row[BUILDER_CIRCLE_COL.ORGANIZER_ID] || ""),
    city: String(row[BUILDER_CIRCLE_COL.CITY] || ""),
    attendeeCount: parseInt(row[BUILDER_CIRCLE_COL.ATTENDEE_COUNT], 10) || 0,
    groupSize: parseInt(row[BUILDER_CIRCLE_COL.GROUP_SIZE], 10) || 4,
    vrfSeed: String(row[BUILDER_CIRCLE_COL.VRF_SEED] || ""),
    vrfFulfilled:
      row[BUILDER_CIRCLE_COL.VRF_FULFILLED] === true ||
      String(row[BUILDER_CIRCLE_COL.VRF_FULFILLED]).toLowerCase() === "true",
    circles: circles,
    status: String(row[BUILDER_CIRCLE_COL.STATUS] || "assigned").trim().toLowerCase(),
  };
}

function handleMeetupCheckinsGet_(e) {
  const meetupId = e.parameter.meetupId ? String(e.parameter.meetupId).trim() : "";
  if (!meetupId) {
    return jsonOutput({ ok: false, error: "meetupId required" });
  }

  const checkinsSh = getCheckinsSheet_();
  const membersSh = getSheet_();
  const lastRow = checkinsSh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, checkins: [] });
  }

  const rows = checkinsSh.getRange(2, 1, lastRow - 1, CHECKIN_COL.REPUTATION_AWARDED + 1).getValues();
  const checkins = [];
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[CHECKIN_COL.MEETUP_ID]).trim() !== meetupId) continue;
    const communityId = String(row[CHECKIN_COL.COMMUNITY_ID]).trim().toUpperCase();
    const memberRow = findRowByCommunityId_(membersSh, communityId);
    const member = memberRow ? rowToMember_(memberRow) : null;
    checkins.push({
      createdAt: String(row[CHECKIN_COL.CREATED_AT] || ""),
      meetupId: meetupId,
      communityId: communityId,
      email: String(row[CHECKIN_COL.EMAIL] || ""),
      fullName: member ? member.fullName : "",
      city: member ? member.city : "",
      country: member ? member.country : "",
      xUsername: member ? member.xUsername : "",
    });
  }

  return jsonOutput({ ok: true, checkins: checkins });
}

function handleMeetupRsvpsGet_(e) {
  const meetupId = e.parameter.meetupId ? String(e.parameter.meetupId).trim() : "";
  if (!meetupId) {
    return jsonOutput({ ok: false, error: "meetupId required" });
  }

  const rsvpsSh = getMeetupRsvpsSheet_();
  const lastRow = rsvpsSh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, rsvps: [] });
  }

  const rows = rsvpsSh.getRange(2, 1, lastRow - 1, RSVP_COL.X_USERNAME + 1).getValues();
  const rsvps = [];
  const targetMeetup = meetupId.toLowerCase();
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (
      String(row[RSVP_COL.MEETUP_ID])
        .trim()
        .toLowerCase() !== targetMeetup
    ) {
      continue;
    }
    rsvps.push(rowToMeetupRsvpParticipant_(row, meetupId));
  }

  return jsonOutput({ ok: true, rsvps: rsvps });
}

function handleMembersByCityGet_(e) {
  const city = e.parameter.city ? String(e.parameter.city).trim() : "";
  if (!city) {
    return jsonOutput({ ok: false, error: "city required" });
  }

  const sh = getSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) {
    return jsonOutput({ ok: true, members: [] });
  }

  const rows = sh.getRange(2, 1, lastRow - 1, COL.REPUTATION + 1).getValues();
  const members = [];
  for (var i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!citiesMatch_(row[COL.CITY], city)) continue;
    members.push(memberRowToParticipant_(row, ""));
  }

  return jsonOutput({ ok: true, members: members });
}

function handleMeetupRsvpPost_(body) {
  const meetupId = String(body.meetupId || "")
    .trim()
    .toLowerCase();
  const communityId = String(body.communityId || "")
    .trim()
    .toUpperCase();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const city = String(body.city || "").trim();
  const country = String(body.country || "").trim();
  const xUsername = String(body.xUsername || "").trim();

  if (!meetupId || !communityId || !email) {
    return jsonOutput({ ok: false, error: "meetupId, communityId, and email required" });
  }

  const sh = getMeetupRsvpsSheet_();
  const existingRow = findMeetupRsvpRowIndex_(sh, meetupId, communityId);
  if (existingRow !== -1) {
    const row = sh.getRange(existingRow, 1, 1, RSVP_COL.X_USERNAME + 1).getValues()[0];
    return jsonOutput({
      ok: true,
      alreadyRecorded: true,
      rsvp: rowToMeetupRsvpParticipant_(row, meetupId),
    });
  }

  const now = new Date().toISOString();
  sh.appendRow([now, meetupId, communityId, email, fullName, city, country, xUsername]);

  return jsonOutput({
    ok: true,
    alreadyRecorded: false,
    rsvp: {
      createdAt: now,
      meetupId: meetupId,
      communityId: communityId,
      email: email,
      fullName: fullName,
      city: city,
      country: country,
      xUsername: xUsername,
    },
  });
}

function handleBuilderCirclesGet_(e) {
  const meetupId = e.parameter.meetupId ? String(e.parameter.meetupId).trim() : "";
  if (!meetupId) {
    return jsonOutput({ ok: false, error: "meetupId required" });
  }

  const sh = getBuilderCirclesSheet_();
  const rowIndex = findBuilderCircleRowIndex_(sh, meetupId);
  if (rowIndex === -1) {
    return jsonOutput({ ok: false, error: "not found" });
  }

  const row = sh.getRange(rowIndex, 1, 1, BUILDER_CIRCLE_COL.STATUS + 1).getValues()[0];
  return jsonOutput({ ok: true, assignment: rowToBuilderCircleAssignment_(row) });
}

function handleBuilderCirclesStore_(body) {
  const meetupId = String(body.meetupId || "").trim().toLowerCase();
  const organizerId = String(body.organizerId || "").trim().toUpperCase();
  const city = String(body.city || "").trim();
  const attendeeCount = parseInt(body.attendeeCount, 10) || 0;
  const groupSize = parseInt(body.groupSize, 10) || 4;
  const vrfSeed = String(body.vrfSeed || "");
  const vrfFulfilled = body.vrfFulfilled === true;
  const circles = body.circles || [];
  const status = String(body.status || "assigned").trim().toLowerCase();

  if (!meetupId || !city || !circles.length) {
    return jsonOutput({ ok: false, error: "meetupId, city, and circles required" });
  }

  const sh = getBuilderCirclesSheet_();
  const rowIndex = findBuilderCircleRowIndex_(sh, meetupId);
  const now = new Date().toISOString();
  const circlesJson = JSON.stringify({ circles: circles });

  if (rowIndex === -1) {
    sh.appendRow([
      now,
      meetupId,
      organizerId,
      city,
      attendeeCount,
      groupSize,
      vrfSeed,
      vrfFulfilled,
      circlesJson,
      status,
    ]);
    return jsonOutput({
      ok: true,
      created: true,
      assignment: {
        createdAt: now,
        meetupId: meetupId,
        organizerId: organizerId,
        city: city,
        attendeeCount: attendeeCount,
        groupSize: groupSize,
        vrfSeed: vrfSeed,
        vrfFulfilled: vrfFulfilled,
        circles: circles,
        status: status,
      },
    });
  }

  const existing = sh.getRange(rowIndex, 1, 1, BUILDER_CIRCLE_COL.STATUS + 1).getValues()[0];
  const createdAt = String(existing[BUILDER_CIRCLE_COL.CREATED_AT] || now);
  sh.getRange(rowIndex, 1, 1, BUILDER_CIRCLE_COL.STATUS + 1).setValues([
    [
      createdAt,
      meetupId,
      organizerId || String(existing[BUILDER_CIRCLE_COL.ORGANIZER_ID] || ""),
      city,
      attendeeCount,
      groupSize,
      vrfSeed || String(existing[BUILDER_CIRCLE_COL.VRF_SEED] || ""),
      vrfFulfilled,
      circlesJson,
      status,
    ],
  ]);

  return jsonOutput({
    ok: true,
    created: false,
    assignment: {
      createdAt: createdAt,
      meetupId: meetupId,
      organizerId: organizerId || String(existing[BUILDER_CIRCLE_COL.ORGANIZER_ID] || ""),
      city: city,
      attendeeCount: attendeeCount,
      groupSize: groupSize,
      vrfSeed: vrfSeed || String(existing[BUILDER_CIRCLE_COL.VRF_SEED] || ""),
      vrfFulfilled: vrfFulfilled,
      circles: circles,
      status: status,
    },
  });
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
    organizerId: String(row[EVENT_COL.ORGANIZER_ID] || ""),
    country: String(row[EVENT_COL.COUNTRY] || ""),
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

  const row = sh.getRange(rowIndex, 1, 1, EVENT_COL.COUNTRY + 1).getValues()[0];
  return jsonOutput({ ok: true, event: rowToEvent_(row) });
}

function handleEventPost_(body) {
  const slug = String(body.slug || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const city = String(body.city || "").trim();
  const metadataUri = String(body.metadataUri || "").trim();
  const txHash = String(body.txHash || "").trim();
  const organizerId = String(body.organizerId || "").trim().toUpperCase();
  const country = String(body.country || "").trim();

  if (!slug || !name || !city) {
    return jsonOutput({ ok: false, error: "slug, name, and city required" });
  }

  const sh = getEventsSheet_();
  const rowIndex = findEventRowIndex_(sh, slug);
  const now = new Date().toISOString();

  if (rowIndex === -1) {
    sh.appendRow([now, slug, name, city, metadataUri, txHash, organizerId, country]);
    return jsonOutput({
      ok: true,
      created: true,
      event: {
        createdAt: now,
        slug: slug,
        name: name,
        city: city,
        metadataUri: metadataUri,
        txHash: txHash,
        organizerId: organizerId,
        country: country,
      },
    });
  }

  const existing = sh.getRange(rowIndex, 1, 1, EVENT_COL.COUNTRY + 1).getValues()[0];
  const createdAt = String(existing[EVENT_COL.CREATED_AT] || now);
  sh.getRange(rowIndex, 1, 1, EVENT_COL.COUNTRY + 1).setValues([
    [
      createdAt,
      slug,
      name,
      city,
      metadataUri || String(existing[EVENT_COL.METADATA_URI] || ""),
      txHash || String(existing[EVENT_COL.TX_HASH] || ""),
      organizerId || String(existing[EVENT_COL.ORGANIZER_ID] || ""),
      country || String(existing[EVENT_COL.COUNTRY] || ""),
    ],
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
      organizerId: organizerId || String(existing[EVENT_COL.ORGANIZER_ID] || ""),
      country: country || String(existing[EVENT_COL.COUNTRY] || ""),
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
  if (action === "organizers") {
    return handleOrganizersList_(e);
  }
  if (action === "organizer") {
    return handleOrganizerGet_(e);
  }
  if (action === "organizerEvents") {
    return handleOrganizerEventsGet_(e);
  }
  if (action === "organizerBySecret") {
    return handleOrganizerBySecretGet_(e);
  }
  if (action === "meetupCheckins") {
    return handleMeetupCheckinsGet_(e);
  }
  if (action === "meetupRsvps") {
    return handleMeetupRsvpsGet_(e);
  }
  if (action === "membersByCity") {
    return handleMembersByCityGet_(e);
  }
  if (action === "builderCircles") {
    return handleBuilderCirclesGet_(e);
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
    if (action === "organizerApply") {
      return handleOrganizerApply_(body);
    }
    if (action === "organizerEventCreated") {
      return handleOrganizerEventCreated_(body);
    }
    if (action === "meetupRsvp") {
      return handleMeetupRsvpPost_(body);
    }
    if (action === "builderCirclesStore") {
      return handleBuilderCirclesStore_(body);
    }
    if (action === "organizerCodeUpdate") {
      return handleOrganizerCodeUpdate_(body);
    }
    if (action === "organizerActivate") {
      return handleOrganizerActivate_(body);
    }
    return handleRegisterPost_(body);
  } catch (err) {
    return jsonOutput({ ok: false, error: "bad_request" });
  }
}
