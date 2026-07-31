import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildEligibilityStats,
  filterAttendeesByEventCity,
  runBuilderCircleMatching,
  selectParticipantPool,
  validateBuilderCircleEligibility,
  validateHybridPoolEligibility,
} from "../src/lib/builder-circle-matching";
import type { MeetupCheckinAttendee } from "../src/lib/builder-circle-config";

const attendees: MeetupCheckinAttendee[] = [
  {
    createdAt: "",
    meetupId: "demo",
    communityId: "DEV-0001",
    email: "a@example.com",
    fullName: "Ada",
    city: "Lagos",
    country: "Nigeria",
    xUsername: "ada",
  },
  {
    createdAt: "",
    meetupId: "demo",
    communityId: "DEV-0002",
    email: "b@example.com",
    fullName: "Ben",
    city: "Lagos",
    country: "Nigeria",
    xUsername: "",
  },
  {
    createdAt: "",
    meetupId: "demo",
    communityId: "DEV-0003",
    email: "c@example.com",
    fullName: "Cara",
    city: "Abuja",
    country: "Nigeria",
    xUsername: "",
  },
  {
    createdAt: "",
    meetupId: "demo",
    communityId: "DEV-0004",
    email: "d@example.com",
    fullName: "Dan",
    city: "",
    country: "Nigeria",
    xUsername: "",
  },
];

describe("builder circle matching", () => {
  it("filters attendees by event city", () => {
    const filtered = filterAttendeesByEventCity(attendees, "Lagos");
    assert.equal(filtered.length, 2);
  });

  it("requires at least six eligible attendees", () => {
    const result = validateBuilderCircleEligibility(attendees, "Lagos");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /at least 6/i);
    }
  });

  it("builds eligibility stats", () => {
    const stats = buildEligibilityStats(attendees, "Lagos");
    assert.equal(stats.totalCheckins, 4);
    assert.equal(stats.eligibleCount, 2);
    assert.equal(stats.excludedOtherCity, 1);
    assert.equal(stats.excludedMissingCity, 1);
  });

  it("creates deterministic groups from seed", () => {
    const eligible = Array.from({ length: 8 }, (_, index) => ({
      ...attendees[0],
      communityId: `DEV-000${index + 1}`,
      fullName: `Member ${index + 1}`,
    }));

    const first = runBuilderCircleMatching(eligible, 42, 4);
    const second = runBuilderCircleMatching(eligible, 42, 4);
    assert.deepEqual(first, second);
    assert.equal(first.length, 2);
    assert.equal(first[0]?.members.length, 4);
  });

  it("merges RSVP and city pools in hybrid mode", () => {
    const rsvps = attendees.slice(0, 2);
    const cityMembers = [
      ...attendees.slice(0, 2),
      {
        ...attendees[0],
        communityId: "DEV-0005",
        email: "e@example.com",
        fullName: "Eve",
        city: "Lagos",
      },
    ];

    const hybrid = selectParticipantPool("hybrid", rsvps, cityMembers, "Lagos");
    assert.equal(hybrid.length, 3);
  });

  it("validates hybrid pool minimum", () => {
    const rsvps = attendees.slice(0, 2);
    const cityMembers = attendees.slice(0, 2);
    const result = validateHybridPoolEligibility("hybrid", rsvps, cityMembers, "Lagos");
    assert.equal(result.ok, false);
  });
});
