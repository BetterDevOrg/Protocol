import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveOrganizerCodeFromSeed, isPendingOrganizerCode, organizerIdToBytes32 } from "../src/lib/organizer-code";

describe("organizer code", () => {
  it("derives deterministic codes from vrf seed", () => {
    const first = deriveOrganizerCodeFromSeed(42n);
    const second = deriveOrganizerCodeFromSeed(42n);
    assert.equal(first, second);
    assert.match(first, /^ORG-[A-Z2-9]{6}$/);
  });

  it("detects pending placeholder codes", () => {
    assert.equal(isPendingOrganizerCode("PENDING-VRF"), true);
    assert.equal(isPendingOrganizerCode("ORG-A3K9P2"), false);
  });

  it("hashes organizer ids consistently", () => {
    assert.equal(organizerIdToBytes32("org-0001"), organizerIdToBytes32("ORG-0001"));
  });
});
