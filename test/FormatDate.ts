import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatJoinDate } from "../src/lib/format-date";

const expectedDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

describe("formatJoinDate", () => {
  it("formats a valid ISO date", () => {
    const value = "2026-07-27T12:00:00.000Z";
    assert.equal(formatJoinDate(value), expectedDate(value));
  });

  it("returns an invalid date unchanged", () => {
    assert.equal(formatJoinDate("not-a-date"), "not-a-date");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(formatJoinDate(""), "");
  });

  it("formats an ISO date with a timezone offset", () => {
    const value = "2026-07-27T18:30:00+05:30";
    assert.equal(formatJoinDate(value), expectedDate(value));
  });
});
