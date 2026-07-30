import assert from "node:assert/strict";
import {
  formatCommunityIdFromNumber,
  isValidCommunityId,
  normalizeCommunityId,
  sanitizeMemberNumberInput,
  validateCommunityId,
  validateMemberNumberInput,
} from "../src/lib/community-id";

// --- Existing Baseline Tests ---
assert.equal(normalizeCommunityId(" dev-0001 "), "DEV-0001");
assert.equal(validateCommunityId("DEV-0001"), null);
assert.equal(validateCommunityId("dev-12"), "Community ID must look like DEV-0001.");
assert.equal(isValidCommunityId("DEV-9999"), true);
assert.equal(formatCommunityIdFromNumber("1"), "DEV-0001");
assert.equal(formatCommunityIdFromNumber("0042"), "DEV-0042");
assert.equal(sanitizeMemberNumberInput("12ab34"), "1234");
assert.equal(validateMemberNumberInput(""), "Enter your member number (e.g. 0001).");

// --- Issue #3: New Edge Case Assertions ---

assert.equal(normalizeCommunityId("\tdev-1234\n"), "DEV-1234");

assert.equal(formatCommunityIdFromNumber(""), "");
assert.equal(formatCommunityIdFromNumber("abc!@#"), "");
assert.equal(formatCommunityIdFromNumber("12345"), "DEV-2345"); 

assert.equal(sanitizeMemberNumberInput("a1b2c3d4e5"), "1234"); 
assert.equal(sanitizeMemberNumberInput("---"), "");

assert.equal(isValidCommunityId(""), false);
assert.equal(isValidCommunityId("   "), false);
assert.equal(isValidCommunityId("DEV-001"), false); 
assert.equal(isValidCommunityId("DEV-00001"), false); 
assert.equal(isValidCommunityId("ABC-0001"), false); 


assert.equal(validateMemberNumberInput("xyz"), "Enter your member number (e.g. 0001).");
assert.equal(validateMemberNumberInput("1"), null); 

console.log("CommunityId tests passed.");