import { areBetterDevContractsConfigured } from "@/contracts/config";
import { verifyOrganizerMeetupAccess } from "@/lib/builder-circle-access";
import {
  DEFAULT_BUILDER_CIRCLE_GROUP_SIZE,
  type BuilderCircleAssignment,
  type BuilderCirclePoolMode,
  type MeetupCheckinAttendee,
} from "@/lib/builder-circle-config";
import { sendBuilderCircleAssignmentEmails } from "@/lib/builder-circle-email";
import {
  buildHybridEligibilityStats,
  normalizeVrfSeed,
  parseBuilderCirclePoolMode,
  runBuilderCircleMatching,
  selectParticipantPool,
  validateHybridPoolEligibility,
} from "@/lib/builder-circle-matching";
import {
  getMeetupCheckinsFromGoogleSheets,
  getMeetupRsvpsFromGoogleSheets,
  getMembersByCityFromGoogleSheets,
  storeBuilderCirclesInGoogleSheets,
} from "@/lib/google-sheets/client";
import type { OrganizerAuthContext } from "@/lib/organizer-auth";
import { ORGANIZER_REP_EVENT_TYPES } from "@/lib/organizer-reputation";
import { recordOrganizerReputationAction } from "@/lib/organizer-reputation-onchain";
import { readMeetupVrfSeed, requestMeetupVrfSeed } from "@/lib/relayer";
import { randomInt } from "crypto";

function toPoolMember(record: {
  createdAt: string;
  meetupId: string;
  communityId: string;
  email: string;
  fullName: string;
  city: string;
  country: string;
  xUsername: string;
}): MeetupCheckinAttendee {
  return {
    createdAt: record.createdAt,
    meetupId: record.meetupId,
    communityId: record.communityId,
    email: record.email,
    fullName: record.fullName,
    city: record.city,
    country: record.country,
    xUsername: record.xUsername,
  };
}

export async function loadMeetupCheckins(meetupId: string): Promise<MeetupCheckinAttendee[]> {
  const result = await getMeetupCheckinsFromGoogleSheets(meetupId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.checkins.map(toPoolMember);
}

export async function loadMeetupRsvps(meetupId: string): Promise<MeetupCheckinAttendee[]> {
  const result = await getMeetupRsvpsFromGoogleSheets(meetupId);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.rsvps.map(toPoolMember);
}

export async function loadCityMembers(city: string): Promise<MeetupCheckinAttendee[]> {
  const result = await getMembersByCityFromGoogleSheets(city);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.members.map(toPoolMember);
}

export async function getBuilderCircleEligibility(
  context: OrganizerAuthContext,
  meetupId: string,
  poolMode: BuilderCirclePoolMode = "hybrid",
) {
  const access = await verifyOrganizerMeetupAccess(context, meetupId);
  if ("error" in access) {
    return access;
  }

  const [rsvps, cityMembers, checkins] = await Promise.all([
    loadMeetupRsvps(meetupId),
    loadCityMembers(access.event.city),
    loadMeetupCheckins(meetupId),
  ]);

  const stats = buildHybridEligibilityStats(
    rsvps,
    cityMembers,
    checkins,
    access.event.city,
    poolMode,
  );
  const pool = selectParticipantPool(poolMode, rsvps, cityMembers, access.event.city);

  return {
    event: access.event,
    stats,
    poolMode,
    ready: pool.length >= stats.minRequired,
  };
}

type RunMatchingOptions = {
  groupSize?: number;
  requestVrf?: boolean;
  poolMode?: BuilderCirclePoolMode;
};

export async function runBuilderCircleAssignment(
  context: OrganizerAuthContext,
  meetupId: string,
  options: RunMatchingOptions = {},
): Promise<
  | {
      error: string;
      status: number;
      stats?: ReturnType<typeof buildHybridEligibilityStats>;
    }
  | {
      assignment: BuilderCircleAssignment;
      vrfPending?: boolean;
      vrfRequestTx?: string;
      emails?: { sent: number; logged: number; skipped: number };
    }
> {
  const access = await verifyOrganizerMeetupAccess(context, meetupId);
  if ("error" in access) {
    return access;
  }

  const poolMode = options.poolMode ?? "hybrid";
  const groupSize = options.groupSize ?? DEFAULT_BUILDER_CIRCLE_GROUP_SIZE;
  if (groupSize < 2 || groupSize > 8) {
    return { error: "Group size must be between 2 and 8.", status: 400 };
  }

  const [rsvps, cityMembers, checkins] = await Promise.all([
    loadMeetupRsvps(meetupId),
    loadCityMembers(access.event.city),
    loadMeetupCheckins(meetupId),
  ]);

  const eligibility = validateHybridPoolEligibility(poolMode, rsvps, cityMembers, access.event.city);
  eligibility.stats.venueCheckins = checkins.length;

  if (!eligibility.ok) {
    return { error: eligibility.error, status: 400, stats: eligibility.stats };
  }

  let vrfFulfilled = false;
  let vrfSeedValue = "";
  let seedNumber: number;
  let vrfPending = false;
  let vrfRequestTx: string | undefined;

  if (areBetterDevContractsConfigured()) {
    try {
      if (options.requestVrf) {
        try {
          const requested = await requestMeetupVrfSeed(meetupId);
          vrfRequestTx = requested.requestTx;
          vrfPending = true;
        } catch (e) {
          const message = e instanceof Error ? e.message.toLowerCase() : "";
          if (!message.includes("already requested") && !message.includes("already fulfilled")) {
            throw e;
          }
        }
      }

      const vrf = await readMeetupVrfSeed(meetupId);
      vrfFulfilled = vrf.fulfilled;
      vrfSeedValue = vrf.seed.toString();
      if (vrf.fulfilled) {
        seedNumber = normalizeVrfSeed(vrf.seed);
        vrfPending = false;
      } else {
        seedNumber = randomInt(1_000_000_000);
        vrfFulfilled = false;
      }
    } catch {
      seedNumber = randomInt(1_000_000_000);
      vrfFulfilled = false;
      vrfSeedValue = String(seedNumber);
    }
  } else {
    seedNumber = randomInt(1_000_000_000);
    vrfSeedValue = String(seedNumber);
    vrfFulfilled = false;
  }

  const circles = runBuilderCircleMatching(eligibility.eligible, seedNumber, groupSize);
  const organizerId =
    context.mode === "city_organizer" ? context.organizer.organizerId : access.event.organizerId;

  const storeResult = await storeBuilderCirclesInGoogleSheets({
    meetupId,
    organizerId,
    city: access.event.city,
    attendeeCount: eligibility.eligible.length,
    groupSize,
    vrfSeed: vrfSeedValue,
    vrfFulfilled,
    circles,
  });

  if (!storeResult.ok) {
    return { error: storeResult.error, status: 502 };
  }

  const emailByCommunityId = new Map<string, string>();
  for (const participant of eligibility.eligible) {
    if (participant.email.trim()) {
      emailByCommunityId.set(participant.communityId.trim().toUpperCase(), participant.email);
    }
  }

  let emails: { sent: number; logged: number; skipped: number } | undefined;
  try {
    emails = await sendBuilderCircleAssignmentEmails({
      eventName: access.event.name,
      meetupId,
      circles,
      emailByCommunityId,
    });
  } catch (e) {
    console.error("[builder-circle-service] email dispatch failed", e);
  }

  if (context.mode === "city_organizer" && organizerId) {
    await recordOrganizerReputationAction({
      organizerId,
      eventType: ORGANIZER_REP_EVENT_TYPES.BUILDER_CIRCLES,
      meetupSlug: meetupId,
      proofURI: `${process.env.PASSPORT_METADATA_BASE_URL || "https://betterdev.live"}/meetup/${meetupId}/circles`,
      incrementEventsHosted: false,
    });
  }

  return {
    assignment: storeResult.assignment,
    vrfPending,
    vrfRequestTx,
    emails,
  };
}

export function toPublicAssignment(assignment: BuilderCircleAssignment) {
  return {
    meetupId: assignment.meetupId,
    city: assignment.city,
    attendeeCount: assignment.attendeeCount,
    groupSize: assignment.groupSize,
    vrfFulfilled: assignment.vrfFulfilled,
    status: assignment.status,
    circles: assignment.circles,
    createdAt: assignment.createdAt,
  };
}

export { parseBuilderCirclePoolMode };
