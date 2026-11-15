import test from "node:test";
import assert from "node:assert/strict";
import redFlagEmails from "../data/redFlagEmails.js";
import { pickHuntEmails, toPublicEmail, scoreHunt } from "../lib/hunt.js";

const flagIds = (id) =>
  redFlagEmails.find((e) => e.id === id).segments.filter((s) => s.flag).map((s) => s.id);

test("pool has 15 emails, unique ids, at least 3 clean", () => {
  assert.equal(redFlagEmails.length, 15);
  assert.equal(new Set(redFlagEmails.map((e) => e.id)).size, 15);
  assert.ok(redFlagEmails.filter((e) => e.segments.every((s) => !s.flag)).length >= 3);
  for (const email of redFlagEmails) {
    assert.equal(new Set(email.segments.map((s) => s.id)).size, email.segments.length);
    for (const s of email.segments) if (s.flag) assert.ok(s.reason.length > 10);
  }
});

test("a run has 5 different emails and one clean one", () => {
  for (let i = 0; i < 50; i += 1) {
    const run = pickHuntEmails();
    assert.equal(run.length, 5);
    assert.equal(new Set(run.map((e) => e.id)).size, 5);
    assert.ok(run.some((e) => e.segments.every((s) => !s.flag)));
  }
});

test("public email hides the answers", () => {
  const text = JSON.stringify(toPublicEmail(redFlagEmails[0]));
  assert.ok(!text.includes("flag"));
  assert.ok(!text.includes("reason"));
});

test("all flags found is a perfect score", () => {
  const result = scoreHunt([{ emailId: "netflix-billing", tapped: flagIds("netflix-billing") }]);
  assert.equal(result.score, 50);
  assert.equal(result.maxScore, 50);
  assert.equal(result.perfect, true);
});

test("a safe tap costs 5 points", () => {
  const result = scoreHunt([{ emailId: "netflix-billing", tapped: [...flagIds("netflix-billing"), "body"] }]);
  assert.equal(result.score, 45);
  assert.equal(result.wrongTaps, 1);
  assert.equal(result.perfect, false);
});

test("clean email: 10 for no taps, less for taps, never below 0", () => {
  assert.equal(scoreHunt([{ emailId: "school-trip", tapped: [] }]).score, 10);
  assert.equal(scoreHunt([{ emailId: "school-trip", tapped: ["from"] }]).score, 5);
  assert.equal(scoreHunt([{ emailId: "school-trip", tapped: ["from", "subject", "body"] }]).score, 0);
});

test("unknown ids, repeats and bad input are ignored", () => {
  assert.equal(scoreHunt([{ emailId: "nope", tapped: ["from"] }]).maxScore, 0);
  assert.equal(scoreHunt([{ emailId: "bank-alert", tapped: ["ghost", "pin", "pin"] }]).score, 10);
  const twice = scoreHunt([
    { emailId: "bank-alert", tapped: ["pin"] },
    { emailId: "bank-alert", tapped: ["pin", "from", "greeting"] },
  ]);
  assert.equal(twice.score, 10);
  for (const bad of [undefined, null, {}, "x", [null, 5, {}]]) {
    const result = scoreHunt(bad);
    assert.equal(result.score, 0);
    assert.equal(result.perfect, false);
  }
});
