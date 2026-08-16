import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/rate-limit";

const key = `test-${Date.now()}-${Math.random()}`;

assert.equal(checkRateLimit(key, 3, 10_000).ok, true);
assert.equal(checkRateLimit(key, 3, 10_000).ok, true);
assert.equal(checkRateLimit(key, 3, 10_000).ok, true);

const blocked = checkRateLimit(key, 3, 10_000);
assert.equal(blocked.ok, false);
assert.ok(blocked.retryAfterSeconds > 0);

const otherKey = `test-${Date.now()}-${Math.random()}-other`;
assert.equal(checkRateLimit(otherKey, 3, 10_000).ok, true);

console.log("RateLimit tests passed.");
