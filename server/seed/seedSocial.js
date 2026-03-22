/**
 * Seed social media game questions into MongoDB.
 * Run with: node seed/seedSocial.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import SocialAiImage from "../models/SocialAiImage.js";
import SocialCommentScenario from "../models/SocialCommentScenario.js";
import SocialSetting from "../models/SocialSetting.js";

dotenv.config();

// ---------------------------------------------------------------------------
// Act 1 — Spot the AI Image
// ---------------------------------------------------------------------------
const AI_IMAGES = [
  {
    order: 0,
    type: "single",
    imgSrc: "/be-blog-quiz-real-or-ai-titanic-1.jpg",
    subject: "The Titanic, 1912",
    isAI: true,
    aiTells: ["Colour photography did not exist in 1912", "Lighting is too cinematic and perfect", "Water reflections are unrealistically smooth"],
    tell: "This is AI generated. Real photographs from 1912 were black and white — colour photography like this simply did not exist. The dramatic sunset and perfect water reflections are AI giveaways. Always check whether the style of a photo matches the time period it claims to show.",
  },
  {
    order: 1,
    type: "single",
    imgSrc: "/be-blog-quiz-real-or-ai-titanic.jpg",
    subject: "The Titanic, 1912",
    isAI: false,
    aiTells: [],
    tell: "This is a genuine historical photograph. It has the natural grain, faded tones, and imperfections you would expect from a real early 1900s image ",
  },
  {
    order: 2,
    type: "side-by-side",
    imgSrc: "/ai-generated-or-real-1755862783323.webp",
    subject: "Statue of Liberty",
    realSide: "left",
    aiTells: ["Right side: no people or crowds visible", "Right side: background too clean and perfect", "Right side: unnaturally even lighting"],
    tell: "The left image is real. The right is AI gen — there are no people at the base, the background skyline is too clean, and the lighting is perfectly even with no natural variation. Real photos of busy landmarks always show people and natural imperfections.",
  },
  {
    order: 3,
    type: "side-by-side",
    imgSrc: "/ai-or-real-quiz-1755358426764.webp",
    subject: "Snowman",
    realSide: "right",
    aiTells: ["Left side: snow is too smooth and uniform", "Left side: proportions are unnaturally perfect", "Left side: mitten hands look strange on stick arms"],
    tell: "The right image is real. The left is AI generated — the snow is unnaturally smooth, the proportions are too perfect, and the mitten hands sitting on stick arms look unnatural. Real snowmen are lopsided and imperfect, made by actual hands.",
  },
];

// ---------------------------------------------------------------------------
// Act 2 — The Comment Section
// ---------------------------------------------------------------------------
const COMMENT_SCENARIOS = [
  {
    order: 0,
    post: { author: "User 1", handle: "@user1", text: "Just finished building the biggest castle I have ever made in Minecraft. Took me three whole days!", likes: 312, time: "1 hour ago" },
    comments: [
      { author: "User 2",           handle: "@user2",             text: "That sounds amazing! Can you share a screenshot?", isBot: false },
      { author: "Free Robux Now",   handle: "@free_robux_now",    text: "Get 50,000 FREE coins today Click here before it expires", isBot: true },
      { author: "User 3",           handle: "@user3",             text: "Three days is serious dedication. What did you build inside it?", isBot: false },
      { author: "Game Prizes IE",   handle: "@game_prizes_ie",    text: "YOU have been chosen to win a FREE gaming PC! Claim your prize now: win-gaming-pc.com", isBot: true },
      { author: "User 4",           handle: "@user4",             text: "I tried building a castle once and gave up after an hour. Respect.", isBot: false },
    ],
    tip: "Real friends ask questions about your post. Bots skip straight to links and prize offers that seem too good to be true.",
  },
  {
    order: 1,
    post: { author: "User 5", handle: "@user5", text: "Posted my first drawing online today. I spent all weekend on it and I am really proud of how it turned out!", likes: 87, time: "30 minutes ago" },
    comments: [
      { author: "User 6",         handle: "@user6",             text: "This is brilliant! You have a real talent for this.", isBot: false },
      { author: "Art Prize Bot",  handle: "@artprize_winner",   text: "CONGRATULATIONS! Your drawing has been selected to WIN a prize. Send us your address to claim: artwin-ie.net", isBot: true },
      { author: "User 7",         handle: "@user7",             text: "The colours you used are so nice. What did you use to draw it?", isBot: false },
      { author: "Viral Art Now",  handle: "@viral_art_now",     text: "Want 10,000 likes on your drawing? Follow us and click here: like-boost-free.net", isBot: true },
      { author: "User 8",         handle: "@user8",             text: "I love the background especially. Keep posting more!", isBot: false },
    ],
    tip: "Bots target people who share things they are proud of. They use fake prizes and fake likes to get your personal details.",
  },
  {
    order: 2,
    post: { author: "User 9", handle: "@user9", text: "Our school team won the county final today! We were 2-0 down at half time and came back to win 3-2. Best day ever.", likes: 541, time: "2 hours ago" },
    comments: [
      { author: "User 10",          handle: "@user10",             text: "That comeback is unreal! Congrats to the whole team.", isBot: false },
      { author: "Sports Giveaway",   handle: "@sports_giveaway_ie", text: "WIN free football boots! You have been randomly selected. Tap here to claim: free-boots-ie.net", isBot: true },
      { author: "User 11",          handle: "@user11",             text: "2-0 down and still won? You must have been buzzing at the final whistle.", isBot: false },
      { author: "User 12",          handle: "@user12",             text: "Amazing result. Who scored the winning goal?", isBot: false },
      { author: "Kit Deals Bot",     handle: "@kit_deals_daily",    text: "BREAKING: Free sports kit giveaway ending TODAY. Click before midnight: free-kit-ireland.ie", isBot: true },
    ],
    tip: "Bots jump into exciting posts with fake giveaways. They use deadlines like 'ending today' or 'midnight' to rush you into clicking.",
  },
  {
  order: 3,
  post: { author: "User 13", handle: "@user13", text: "Just got my CAO offer this morning. I got into Computer Science at TU Dublin. I have been dreaming about this since sixth year. Cannot believe it is finally real!", likes: 489, time: "2 hours ago" },
  comments: [
    { author: "User 14",          handle: "@user14",             text: "Congratulations! That is such a tough course to get into. You absolutely deserve it.", isBot: false },
    { author: "Student Deals IE",  handle: "@studentdeals_ie",    text: "NEW TUD STUDENT? Claim your FREE laptop before stock runs out! Limited offer: free-laptop-students.ie", isBot: true },
    { author: "User 15",          handle: "@user15",             text: "I am in second year there now. Best decision I ever made. You are going to love the Grangegorman campus.", isBot: false },
    { author: "Rooms4Students",    handle: "@rooms4students_ie",  text: "URGENT: Student rooms near TUD from €50 per month! Only 3 left — book now before they are gone: tud-stays-cheap.ie", isBot: true },
    { author: "User 16",          handle: "@user16",             text: "Which campus will you be on? A few of us from school are going to Blanchardstown!", isBot: false },
  ],
  tip: "Scammers watch for CAO results day posts because they know students are excited and distracted. Fake accommodation and free laptop offers always use urgency — 'only 3 left' or 'limited offer' — to stop you thinking carefully. Always go directly to the official TUD website.",
},

  {
    order: 4,
    post: { author: "User 17", handle: "@user17", text: "Just uploaded my first ever YouTube video. It is a tutorial on how I made my stop-motion animation for school. Hope someone finds it useful!", likes: 164, time: "3 hours ago" },
    comments: [
      { author: "User 18",          handle: "@user18",            text: "I watched it and it was really clear and easy to follow. Great job!", isBot: false },
      { author: "Sub4Sub Bot",      handle: "@sub4sub_growth",    text: "Subscribe to my channel and I will subscribe back! Guaranteed 1000 subs fast: sub4sub-grow.net", isBot: true },
      { author: "User 19",          handle: "@user19",            text: "Stop motion takes so much patience. Your video was really well explained.", isBot: false },
      { author: "View Booster",     handle: "@view_booster_ie",   text: "Get 100,000 views on your video overnight! Real viewers guaranteed: boost-views-now.com", isBot: true },
      { author: "User 20",          handle: "@user20",            text: "This is exactly what I needed. I have been trying to learn stop-motion for ages.", isBot: false },
    ],
    tip: "Bots in comment sections often offer fake subscribers or views. These services can get your account banned and are never real.",
  },
];

// ---------------------------------------------------------------------------
// Act 3 — Privacy Settings
// ---------------------------------------------------------------------------
const SETTINGS = [
  { order: 0, label: "Who can see my profile",   desc: "Your photos and posts are visible to...", dangerous: true,  current: "Everyone",  safe: "Friends only", tip: "If your profile is public, strangers can see your photos, posts, and personal information." },
  { order: 1, label: "Who can send me messages", desc: "Direct messages can be sent by...",       dangerous: true,  current: "Everyone",  safe: "Friends only", tip: "Allowing anyone to message you means strangers and scammers can contact you directly." },
  { order: 2, label: "Show my real name",        desc: "Your full name is displayed on your profile", dangerous: true,  current: "On",   safe: "Off",          tip: "Showing your real name online lets strangers find out who you are. Use a nickname instead." },
  { order: 3, label: "Location sharing",         desc: "The app can see where you are...",        dangerous: true,  current: "Always on", safe: "Off",          tip: "Sharing your location lets apps and strangers track exactly where you are at all times." },
  { order: 4, label: "Who can add me as a friend", desc: "Friend requests can be sent by...",     dangerous: true,  current: "Everyone",  safe: "Friends of friends", tip: "If anyone can add you, strangers can send you friend requests without you knowing them at all." },
  { order: 5, label: "Notification sounds",      desc: "Play a sound for new notifications",      dangerous: false, current: "On",        safe: null,           tip: "" },
  { order: 6, label: "Dark mode",                desc: "Switch the app to a dark colour theme",   dangerous: false, current: "Off",       safe: null,           tip: "" },
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(" Connected to MongoDB");

  await SocialAiImage.deleteMany({});
  await SocialCommentScenario.deleteMany({});
  await SocialSetting.deleteMany({});
  console.log(" Cleared existing social game data");

  await SocialAiImage.insertMany(AI_IMAGES);
  await SocialCommentScenario.insertMany(COMMENT_SCENARIOS);
  await SocialSetting.insertMany(SETTINGS);
  console.log(` Inserted ${AI_IMAGES.length} AI images, ${COMMENT_SCENARIOS.length} comment scenarios, ${SETTINGS.length} settings`);

  await mongoose.disconnect();
  console.log(" Done");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
