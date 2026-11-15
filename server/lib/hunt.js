import redFlagEmails from "../data/redFlagEmails.js";

const POINTS_PER_FLAG = 10;
const WRONG_TAP_PENALTY = 5;
const CLEAN_EMAIL_POINTS = 10;

const isClean = (email) => email.segments.every((segment) => !segment.flag);

function shuffle(list, rng) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pick emails for one run. Always includes one email with no flags.
export function pickHuntEmails(count = 5, rng = Math.random) {
  const clean = shuffle(redFlagEmails.filter(isClean), rng);
  const flagged = shuffle(redFlagEmails.filter((email) => !isClean(email)), rng);
  return shuffle([clean[0], ...flagged.slice(0, count - 1)], rng);
}

// Strip the answers before sending an email to the browser.
export function toPublicEmail(email) {
  return {
    id: email.id,
    from: email.from,
    subject: email.subject,
    segments: email.segments.map(({ id, text }) => ({ id, text })),
  };
}

// submissions: [{ emailId, tapped: [segmentId] }]
export function scoreHunt(submissions) {
  const list = Array.isArray(submissions) ? submissions : [];
  const seen = new Set();
  const emails = [];

  for (const entry of list) {
    const email = redFlagEmails.find((item) => item.id === entry?.emailId);
    if (!email || seen.has(email.id)) continue;
    seen.add(email.id);

    const tapped = new Set(Array.isArray(entry.tapped) ? entry.tapped.map(String) : []);
    const flags = email.segments.filter((segment) => segment.flag);
    const found = flags.filter((segment) => tapped.has(segment.id)).length;
    const wrong = email.segments.filter((segment) => !segment.flag && tapped.has(segment.id)).length;

    const base = flags.length === 0 ? CLEAN_EMAIL_POINTS : found * POINTS_PER_FLAG;
    const maxScore = flags.length === 0 ? CLEAN_EMAIL_POINTS : flags.length * POINTS_PER_FLAG;

    emails.push({
      emailId: email.id,
      found,
      missed: flags.length - found,
      wrong,
      flagsTotal: flags.length,
      score: Math.max(0, base - wrong * WRONG_TAP_PENALTY),
      maxScore,
      segments: email.segments.map((segment) => ({
        id: segment.id,
        flag: segment.flag,
        reason: segment.reason,
        tapped: tapped.has(segment.id),
      })),
    });
  }

  const sum = (key) => emails.reduce((total, item) => total + item[key], 0);
  const score = sum("score");
  const maxScore = sum("maxScore");

  return {
    score,
    maxScore,
    flagsFound: sum("found"),
    flagsTotal: sum("flagsTotal"),
    wrongTaps: sum("wrong"),
    perfect: emails.length > 0 && score === maxScore,
    emails,
  };
}
