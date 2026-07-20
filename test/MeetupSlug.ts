import assert from "node:assert/strict";
import { resolveAppOrigin } from "../src/lib/app-origin";
import {
  buildMeetupMetadataUri,
  slugifyFromName,
  validateMeetupSlug,
} from "../src/lib/meetup-slug";

assert.equal(slugifyFromName("BetterDev Lagos Meetup"), "betterdev-lagos-meetup");
assert.equal(validateMeetupSlug("ab"), "Event slug must be at least 3 characters.");
assert.equal(validateMeetupSlug("valid-slug-001"), null);
assert.equal(validateMeetupSlug("Invalid_Slug"), "Event slug may only use lowercase letters, numbers, and hyphens.");

const uri = buildMeetupMetadataUri("https://example.com", "lagos-001");
assert.equal(uri, "https://example.com/api/meetups/lagos-001/metadata");
assert.ok(!uri.includes("name="));
assert.ok(!uri.includes("city="));

process.env.PASSPORT_METADATA_BASE_URL = "https://betterdev.vercel.app";
assert.equal(resolveAppOrigin("http://localhost:3000"), "https://betterdev.vercel.app");

console.log("MeetupSlug tests passed.");
