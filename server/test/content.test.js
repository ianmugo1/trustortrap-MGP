import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import phishingQuestions from "../data/phishingQuestions.js";
import cyberPetMiniGames from "../data/cyberPetMiniGames.js";

test("30 phishing questions, each well formed", () => {
  assert.equal(phishingQuestions.length, 30);
  assert.equal(new Set(phishingQuestions.map((q) => q.text)).size, 30);
  for (const q of phishingQuestions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.correctOption >= 0 && q.correctOption <= 3);
    assert.ok(q.explanation.length > 10);
    assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
  }
});

test("each Cyber Pet mini-game has 30 unique questions", () => {
  for (const game of Object.values(cyberPetMiniGames)) {
    assert.equal(game.questions.length, 30);
    assert.equal(new Set(game.questions.map((q) => q.id)).size, 30);
  }
});

test("seed scripts never delete", () => {
  for (const file of fs.readdirSync(new URL("../seed/", import.meta.url))) {
    const text = fs.readFileSync(new URL(`../seed/${file}`, import.meta.url), "utf8");
    assert.ok(!text.includes("deleteMany"), file);
  }
});
