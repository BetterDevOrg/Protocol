import { createBuilderCircles } from "@/lib/builder-circles";
import {
  DEFAULT_BUILDER_CIRCLE_GROUP_SIZE,
  MIN_BUILDER_CIRCLE_PARTICIPANTS,
  type BuilderCirclePoolMode,
  type MeetupCheckinAttendee,
  type StoredBuilderCircle,
  type StoredBuilderCircleMember,
} from "@/lib/builder-circle-config";
import { citiesMatch } from "@/lib/organizer-city";
import type { BuilderCircleMember } from "@/lib/passport";

export function filterAttendeesByEventCity(
  attendees: MeetupCheckinAttendee[],
  eventCity: string,
): MeetupCheckinAttendee[] {
  return attendees.filter((attendee) => {
    if (!attendee.city.trim()) return false;
    return citiesMatch(attendee.city, eventCity);
  });
}

export function mergeParticipantPools(
  rsvps: MeetupCheckinAttendee[],
  cityMembers: MeetupCheckinAttendee[],
): MeetupCheckinAttendee[] {
  const byId = new Map<string, MeetupCheckinAttendee>();
  for (const member of cityMembers) {
    byId.set(member.communityId.trim().toUpperCase(), member);
  }
  for (const rsvp of rsvps) {
    byId.set(rsvp.communityId.trim().toUpperCase(), rsvp);
  }
  return Array.from(byId.values());
}

export function selectParticipantPool(
  mode: BuilderCirclePoolMode,
  rsvps: MeetupCheckinAttendee[],
  cityMembers: MeetupCheckinAttendee[],
  eventCity: string,
): MeetupCheckinAttendee[] {
  const eligibleRsvps = filterAttendeesByEventCity(rsvps, eventCity);
  const eligibleCityMembers = filterAttendeesByEventCity(cityMembers, eventCity);

  switch (mode) {
    case "rsvp":
      return eligibleRsvps;
    case "city":
      return eligibleCityMembers;
    case "hybrid":
      return mergeParticipantPools(eligibleRsvps, eligibleCityMembers);
  }
}

export function toBuilderCircleMembers(attendees: MeetupCheckinAttendee[]): BuilderCircleMember[] {
  return attendees.map((attendee) => ({
    id: attendee.communityId,
    name: attendee.fullName || attendee.communityId,
    role: attendee.xUsername ? `@${attendee.xUsername.replace(/^@/, "")}` : "Member",
    city: attendee.city,
  }));
}

export function toStoredBuilderCircles(
  circles: ReturnType<typeof createBuilderCircles>,
): StoredBuilderCircle[] {
  return circles.map((circle) => ({
    id: circle.id,
    members: circle.members.map(
      (member): StoredBuilderCircleMember => ({
        communityId: member.id,
        fullName: member.name,
        city: member.city,
        role: member.role,
      }),
    ),
  }));
}

export type EligibilityStats = {
  totalCheckins: number;
  eligibleCount: number;
  excludedOtherCity: number;
  excludedMissingCity: number;
  eventCity: string;
  minRequired: number;
};

export type HybridEligibilityStats = {
  poolMode: BuilderCirclePoolMode;
  rsvpCount: number;
  cityMemberCount: number;
  hybridPoolCount: number;
  venueCheckins: number;
  eligibleCount: number;
  excludedOtherCity: number;
  excludedMissingCity: number;
  eventCity: string;
  minRequired: number;
};

function countCityExclusions(
  attendees: MeetupCheckinAttendee[],
  eventCity: string,
): { eligible: number; excludedOtherCity: number; excludedMissingCity: number } {
  let eligible = 0;
  let excludedOtherCity = 0;
  let excludedMissingCity = 0;

  for (const attendee of attendees) {
    if (!attendee.city.trim()) {
      excludedMissingCity += 1;
      continue;
    }
    if (!citiesMatch(attendee.city, eventCity)) {
      excludedOtherCity += 1;
      continue;
    }
    eligible += 1;
  }

  return { eligible, excludedOtherCity, excludedMissingCity };
}

export function buildEligibilityStats(
  attendees: MeetupCheckinAttendee[],
  eventCity: string,
): EligibilityStats {
  const counts = countCityExclusions(attendees, eventCity);

  return {
    totalCheckins: attendees.length,
    eligibleCount: counts.eligible,
    excludedOtherCity: counts.excludedOtherCity,
    excludedMissingCity: counts.excludedMissingCity,
    eventCity,
    minRequired: MIN_BUILDER_CIRCLE_PARTICIPANTS,
  };
}

export function buildHybridEligibilityStats(
  rsvps: MeetupCheckinAttendee[],
  cityMembers: MeetupCheckinAttendee[],
  checkins: MeetupCheckinAttendee[],
  eventCity: string,
  poolMode: BuilderCirclePoolMode,
): HybridEligibilityStats {
  const eligibleRsvps = filterAttendeesByEventCity(rsvps, eventCity);
  const eligibleCityMembers = filterAttendeesByEventCity(cityMembers, eventCity);
  const hybridMerged = mergeParticipantPools(eligibleRsvps, eligibleCityMembers);
  const selectedPool = selectParticipantPool(poolMode, rsvps, cityMembers, eventCity);
  const rsvpCounts = countCityExclusions(rsvps, eventCity);
  const cityCounts = countCityExclusions(cityMembers, eventCity);

  return {
    poolMode,
    rsvpCount: rsvpCounts.eligible,
    cityMemberCount: cityCounts.eligible,
    hybridPoolCount: hybridMerged.length,
    venueCheckins: checkins.length,
    eligibleCount: selectedPool.length,
    excludedOtherCity: rsvpCounts.excludedOtherCity + cityCounts.excludedOtherCity,
    excludedMissingCity: rsvpCounts.excludedMissingCity + cityCounts.excludedMissingCity,
    eventCity,
    minRequired: MIN_BUILDER_CIRCLE_PARTICIPANTS,
  };
}

export function validateBuilderCircleEligibility(
  attendees: MeetupCheckinAttendee[],
  eventCity: string,
  poolLabel = "participants",
): { ok: true; eligible: MeetupCheckinAttendee[] } | { ok: false; error: string; stats: EligibilityStats } {
  const stats = buildEligibilityStats(attendees, eventCity);

  if (stats.eligibleCount < MIN_BUILDER_CIRCLE_PARTICIPANTS) {
    return {
      ok: false,
      error: `Need at least ${MIN_BUILDER_CIRCLE_PARTICIPANTS} ${poolLabel} in ${eventCity}. Currently ${stats.eligibleCount}.`,
      stats,
    };
  }

  return {
    ok: true,
    eligible: filterAttendeesByEventCity(attendees, eventCity),
  };
}

export function validateHybridPoolEligibility(
  mode: BuilderCirclePoolMode,
  rsvps: MeetupCheckinAttendee[],
  cityMembers: MeetupCheckinAttendee[],
  eventCity: string,
):
  | { ok: true; eligible: MeetupCheckinAttendee[]; stats: HybridEligibilityStats }
  | { ok: false; error: string; stats: HybridEligibilityStats } {
  const pool = selectParticipantPool(mode, rsvps, cityMembers, eventCity);
  const stats = buildHybridEligibilityStats(rsvps, cityMembers, [], eventCity, mode);
  stats.eligibleCount = pool.length;

  const modeLabel =
    mode === "rsvp" ? "RSVPs" : mode === "city" ? "city members" : "RSVPs and city members";

  if (pool.length < MIN_BUILDER_CIRCLE_PARTICIPANTS) {
    return {
      ok: false,
      error: `Need at least ${MIN_BUILDER_CIRCLE_PARTICIPANTS} ${modeLabel} in ${eventCity}. Currently ${pool.length}.`,
      stats: { ...stats, eligibleCount: pool.length },
    };
  }

  return {
    ok: true,
    eligible: pool,
    stats: { ...stats, eligibleCount: pool.length },
  };
}

export function runBuilderCircleMatching(
  eligible: MeetupCheckinAttendee[],
  seed: number,
  groupSize = DEFAULT_BUILDER_CIRCLE_GROUP_SIZE,
): StoredBuilderCircle[] {
  const members = toBuilderCircleMembers(eligible);
  return toStoredBuilderCircles(createBuilderCircles(members, seed, groupSize));
}

export function findMemberCircle(
  circles: StoredBuilderCircle[],
  communityId: string,
): StoredBuilderCircle | null {
  const target = communityId.trim().toUpperCase();
  for (const circle of circles) {
    if (circle.members.some((member) => member.communityId.trim().toUpperCase() === target)) {
      return circle;
    }
  }
  return null;
}

export function normalizeVrfSeed(seed: bigint | number): number {
  const value = typeof seed === "bigint" ? seed : BigInt(seed);
  return Number(value % BigInt(1_000_000_000));
}

export function parseBuilderCirclePoolMode(value: string | null | undefined): BuilderCirclePoolMode {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "rsvp" || normalized === "city" || normalized === "hybrid") {
    return normalized;
  }
  return "hybrid";
}
