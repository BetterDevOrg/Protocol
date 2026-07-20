import { normalizeCommunityId, validateCommunityId } from "@/lib/community-id";
import { verifyCheckinToken } from "@/lib/checkin-token";
import { getEventMeetupId } from "@/lib/event-config";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import {
  getCheckinStatusFromGoogleSheets,
  getEventFromGoogleSheets,
  recordCheckinInGoogleSheets,
} from "@/lib/google-sheets/client";
import { lookupMemberByCommunityId } from "@/lib/member-lookup";
import { readMemberOnChainStatus, verifyAttendanceForMember } from "@/lib/relayer";
import type { Member } from "@/types/member";
import { NextResponse } from "next/server";

const ATTENDANCE_POINTS = 20;

type MeetupDisplay = {
  name: string;
  city?: string;
};

async function resolveMeetupDisplay(meetupId: string): Promise<MeetupDisplay> {
  if (isGoogleSheetsConfigured()) {
    const eventResult = await getEventFromGoogleSheets(meetupId);
    if (eventResult.ok) {
      return { name: eventResult.event.name, city: eventResult.event.city };
    }
  }
  return { name: meetupId.replace(/-/g, " ") };
}

function buildCheckinPayload(
  member: Member,
  meetupId: string,
  meetup: MeetupDisplay,
  reputation: number,
  attendanceTx: string,
  alreadyCheckedIn: boolean,
) {
  return {
    ok: true as const,
    alreadyCheckedIn,
    communityId: member.communityId,
    memberDisplay: member.memberDisplay,
    fullName: member.fullName ?? "",
    city: member.city ?? "",
    country: member.country ?? "",
    meetupId,
    meetupName: meetup.name,
    meetupCity: meetup.city,
    reputation,
    pointsAwarded: ATTENDANCE_POINTS,
    attendanceTx,
  };
}

async function syncCheckinToSheets(input: {
  meetupId: string;
  communityId: string;
  email?: string;
  attendanceTx: string;
  reputationAwarded: number;
  totalReputation: number;
}) {
  await recordCheckinInGoogleSheets({
    meetupId: input.meetupId,
    communityId: input.communityId,
    email: input.email,
    attendanceTx: input.attendanceTx,
    reputationAwarded: input.reputationAwarded,
    totalReputation: input.totalReputation,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      communityId?: string;
      token?: string;
      meetupId?: string;
    };

    const communityId = normalizeCommunityId(body.communityId ?? "");
    const token = body.token?.trim() ?? "";
    const meetupId = body.meetupId?.trim() || getEventMeetupId();

    const communityIdError = validateCommunityId(communityId);
    if (communityIdError) {
      return NextResponse.json({ error: communityIdError }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json({ error: "Check-in token is required." }, { status: 400 });
    }

    verifyCheckinToken(token, meetupId);

    const origin = new URL(request.url).origin;
    const member = await lookupMemberByCommunityId(communityId, origin);
    if (!member) {
      return NextResponse.json(
        { error: "Member not found. Register at BetterDev first." },
        { status: 404 },
      );
    }

    const meetup = await resolveMeetupDisplay(meetupId);

    const sheetStatus = await getCheckinStatusFromGoogleSheets(meetupId, { communityId });
    if (sheetStatus.ok && sheetStatus.checkedIn && sheetStatus.attendanceTx) {
      const chainStatus = await readMemberOnChainStatus(member.communityId, meetupId);
      const reputation =
        chainStatus.onChainReputation || sheetStatus.reputationAwarded || ATTENDANCE_POINTS;
      await syncCheckinToSheets({
        meetupId,
        communityId: member.communityId,
        email: member.email,
        attendanceTx: sheetStatus.attendanceTx,
        reputationAwarded: ATTENDANCE_POINTS,
        totalReputation: reputation,
      });
      return NextResponse.json(
        buildCheckinPayload(member, meetupId, meetup, reputation, sheetStatus.attendanceTx, true),
      );
    }

    const chainStatus = await readMemberOnChainStatus(member.communityId, meetupId);
    if (chainStatus.hasAttended) {
      const reputation = chainStatus.onChainReputation || ATTENDANCE_POINTS;
      await syncCheckinToSheets({
        meetupId,
        communityId: member.communityId,
        email: member.email,
        attendanceTx: "on-chain-existing",
        reputationAwarded: ATTENDANCE_POINTS,
        totalReputation: reputation,
      });

      return NextResponse.json(
        buildCheckinPayload(member, meetupId, meetup, reputation, "on-chain-existing", true),
      );
    }

    const proofURI = `${origin}/checkin?meetup=${encodeURIComponent(meetupId)}&member=${encodeURIComponent(member.communityId)}`;

    let attendanceTx: string;
    try {
      const result = await verifyAttendanceForMember(meetupId, member.communityId, proofURI);
      attendanceTx = result.attendanceTx;
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message.toLowerCase().includes("already attended")) {
        const refreshed = await readMemberOnChainStatus(member.communityId, meetupId);
        const reputation = refreshed.onChainReputation || ATTENDANCE_POINTS;
        await syncCheckinToSheets({
          meetupId,
          communityId: member.communityId,
          email: member.email,
          attendanceTx: "on-chain-existing",
          reputationAwarded: ATTENDANCE_POINTS,
          totalReputation: reputation,
        });
        return NextResponse.json(
          buildCheckinPayload(member, meetupId, meetup, reputation, "on-chain-existing", true),
        );
      }
      throw e;
    }

    const updated = await readMemberOnChainStatus(member.communityId, meetupId);
    const reputation = updated.onChainReputation || ATTENDANCE_POINTS;

    await syncCheckinToSheets({
      meetupId,
      communityId: member.communityId,
      email: member.email,
      attendanceTx,
      reputationAwarded: ATTENDANCE_POINTS,
      totalReputation: reputation,
    });

    return NextResponse.json(
      buildCheckinPayload(member, meetupId, meetup, reputation, attendanceTx, false),
    );
  } catch (e) {
    console.error("[meetups/checkin]", e);
    const message = e instanceof Error ? e.message : "Check-in failed.";
    const status =
      message.includes("expired") || message.includes("Invalid check-in")
        ? 401
        : message.includes("not configured") || message.includes("Missing")
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
