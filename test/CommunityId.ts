import assert from "node:assert/strict";
import {
  formatCommunityIdFromNumber,
  isValidCommunityId,
  normalizeCommunityId,
  sanitizeMemberNumberInput,
  validateCommunityId,
  validateMemberNumberInput,
} from "../src/lib/community-id";

assert.equal(normalizeCommunityId(" dev-0001 "), "DEV-0001");
assert.equal(validateCommunityId("DEV-0001"), null);
assert.equal(validateCommunityId("dev-12"), "Community ID must look like DEV-0001.");
assert.equal(isValidCommunityId("DEV-9999"), true);
assert.equal(formatCommunityIdFromNumber("1"), "DEV-0001");
assert.equal(formatCommunityIdFromNumber("0042"), "DEV-0042");
assert.equal(sanitizeMemberNumberInput("12ab34"), "1234");
assert.equal(validateMemberNumberInput(""), "Enter your member number (e.g. 0001).");

console.log("CommunityId tests passed.");
