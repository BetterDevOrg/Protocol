import assert from "node:assert/strict";
import { formatJoinDate } from "../src/lib/format-date";

const validIsoDate = "2026-07-27T12:00:00.000Z";
const expectedDate = new Date(validIsoDate).toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

assert.equal(formatJoinDate(validIsoDate), expectedDate);
assert.equal(formatJoinDate("not-a-date"), "not-a-date");

console.log("FormatDate tests passed.");
