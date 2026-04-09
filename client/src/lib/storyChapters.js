export const STORY_CHAPTERS = [
  {
    slug: "phishing",
    chapterNumber: 1,
    title: "The Sneaky Message",
    subtitle: "A story about phishing",
    icon: "message",
    accent: "from-sky-500 via-cyan-500 to-emerald-400",
    softAccent: "border-sky-200 bg-sky-50 text-sky-900",
    definitionTitle: "What is phishing?",
    definition:
      "Phishing is when someone sends a fake message to trick you into clicking, sharing secrets, or logging in.",
    relatedTopic: "phishing",
    whyItMatters:
      "Phishing messages often pretend to be from games, schools, or apps so kids feel rushed and click before checking.",
    relatedGame: {
      href: "/games/phishing",
      label: "Try Phishing Detection",
    },
    clueTitle: "Clues Mia notices",
    clues: [
      "The message says 'Click now or lose your account.'",
      "The sender name looks real, but the link feels strange.",
      "It tries to scare Mia into acting fast.",
    ],
    safetyRules: [
      "Pause before you tap.",
      "Ask a trusted adult or teacher if a message feels scary or rushed.",
      "Use the real app or website instead of the link in the message.",
    ],
    slides: [
      {
        scene: "After school",
        title: "Mia gets a surprise alert",
        body:
          "Mia is about to play her favorite game when a message pops up: 'Your account will close in 5 minutes!'",
        visual: "Phone screen flashing a bright red warning bubble.",
      },
      {
        scene: "The trap",
        title: "The message wants a fast click",
        body:
          "The message says there is only one way to fix the problem: tap a link and sign in right away.",
        visual: "A giant button that says FIX NOW.",
      },
      {
        scene: "The smart move",
        title: "Mia stops and checks",
        body:
          "Instead of tapping, Mia opens the real game app. Everything is normal. The scary message was fake.",
        visual: "The fake message shrinks while a green shield appears.",
      },
      {
        scene: "Lesson learned",
        title: "Scary does not mean true",
        body:
          "Phishing works by making people feel worried. When you slow down and check, the trick loses its power.",
        visual: "Mia smiling beside a checklist: pause, check, ask.",
      },
    ],
  },
  {
    slug: "social-ai",
    chapterNumber: 2,
    title: "The Fake Famous Friend",
    subtitle: "A story about AI and online fraud",
    icon: "bot",
    accent: "from-fuchsia-500 via-pink-500 to-orange-400",
    softAccent: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
    definitionTitle: "What is AI fraud?",
    definition:
      "AI fraud happens when people use smart tools to make fake pictures, fake voices, or fake messages that look real.",
    relatedTopic: "aiSafety",
    whyItMatters:
      "Online scams are more dangerous when fake stories, videos, and voices look trustworthy enough to fool friends and families.",
    relatedGame: {
      href: "/games/social",
      label: "Try Feed or Fraud",
    },
    clueTitle: "Clues Jay notices",
    clues: [
      "A famous creator offers a prize but wants money first.",
      "A voice note sounds like a friend, but it asks for help in a weird way.",
      "The account is new even though it pretends to be popular.",
    ],
    safetyRules: [
      "Do not trust a voice or video just because it looks real.",
      "Check with the real person in another way.",
      "Never send money, codes, or passwords because of online pressure.",
    ],
    slides: [
      {
        scene: "Scrolling time",
        title: "Jay sees a giveaway story",
        body:
          "A flashy story promises a free tablet. It says winners must pay a tiny fee first to claim it.",
        visual: "A bright story with confetti, hearts, and a countdown sticker.",
      },
      {
        scene: "Something feels odd",
        title: "Then a voice note arrives",
        body:
          "A message sounds exactly like Jay's cousin asking for quick money. Jay feels confused because the voice sounds real.",
        visual: "A glowing voice note wave with a worried face emoji.",
      },
      {
        scene: "The check",
        title: "Jay uses another way to verify",
        body:
          "Jay calls the cousin directly. The cousin answers and says, 'That was not me. My account was copied.'",
        visual: "Two phones connected by a bright safety line.",
      },
      {
        scene: "Big idea",
        title: "AI can copy trust",
        body:
          "Fake voices, edited pictures, and copied profiles can trick people. That is why checking is more important than guessing.",
        visual: "A fake mask lifting off a phone screen.",
      },
    ],
  },
  {
    slug: "passwords",
    chapterNumber: 3,
    title: "The Cyber Pet Rescue",
    subtitle: "A story about passwords and secrets",
    icon: "dog",
    accent: "from-emerald-500 via-lime-500 to-yellow-400",
    softAccent: "border-emerald-200 bg-emerald-50 text-emerald-900",
    definitionTitle: "What is a strong password?",
    definition:
      "A strong password is a secret key that is hard for others to guess and helps keep your account safe.",
    relatedTopic: "passwords",
    whyItMatters:
      "Weak passwords make it easier for strangers to enter accounts, change settings, or pretend to be you online.",
    relatedGame: {
      href: "/games/cyberpet",
      label: "Protect Your Cyber Pet",
    },
    clueTitle: "Clues Sam notices",
    clues: [
      "Sam uses the pet's name as the password.",
      "The same password is used in more than one place.",
      "A stranger asks for a code that should stay secret.",
    ],
    safetyRules: [
      "Use strong, unique passwords or passphrases.",
      "Keep codes and passwords secret.",
      "If something feels wrong, change the password and ask for help.",
    ],
    slides: [
      {
        scene: "Pet world",
        title: "Sam logs in to feed Byte",
        body:
          "Sam loves taking care of Byte the cyber pet. To make logging in easy, Sam uses a very simple password.",
        visual: "A happy digital pet sitting beside a food bowl.",
      },
      {
        scene: "Trouble appears",
        title: "Byte's account starts acting strange",
        body:
          "The next day, Byte has missing coins and weird outfits. Someone else got into the account.",
        visual: "A shocked cyber pet with missing coins floating away.",
      },
      {
        scene: "The fix",
        title: "Sam makes a better secret",
        body:
          "Sam changes the password, turns on extra protection, and keeps the new secret private.",
        visual: "A key, a shield, and Byte cheering happily.",
      },
      {
        scene: "Lesson learned",
        title: "Secrets protect your digital world",
        body:
          "A strong password is like a strong lock. It keeps your spaces, pets, and accounts safer from trouble.",
        visual: "A locked treasure chest with Byte sitting safely on top.",
      },
    ],
  },
  {
    slug: "scam-mix",
    chapterNumber: 4,
    title: "The Four-Trick Scam Day",
    subtitle: "A story about mixed scam tricks",
    icon: "message",
    accent: "from-indigo-500 via-blue-500 to-cyan-400",
    softAccent: "border-indigo-200 bg-indigo-50 text-indigo-900",
    definitionTitle: "What is a mixed scam?",
    definition:
      "A mixed scam is when tricksters use different fake messages in one day to steal money, account items, or login access.",
    relatedTopic: "socialScams",
    whyItMatters:
      "Scammers often try many tricks quickly. Spotting each pattern helps kids stay calm, verify first, and protect their accounts.",
    relatedGame: {
      href: "/games/phishing",
      label: "Practice Scam Spotting",
    },
    clueTitle: "Clues Lina notices",
    clues: [
      "A trader offers rare game items and asks Lina to send coins first.",
      "A 'friend' account asks for urgent help, but the spelling and tone are strange.",
      "A message asks for Lina's one-time code, saying it is needed to keep the account safe.",
      "A fake support agent asks Lina to share her password in chat.",
    ],
    safetyRules: [
      "Never pay first for surprise item trades or giveaways.",
      "Verify friends by calling or messaging them on a known account.",
      "Keep OTP codes private and never share them with anyone.",
      "Real support teams do not ask for your password or codes.",
    ],
    slides: [
      {
        scene: "In-game market",
        title: "The rare skin offer",
        body:
          "Lina gets a message from a player promising ultra-rare items if she sends game coins first. The deal looks exciting, but there is pressure to act now.",
        visual: "A trade window with shiny items and a flashing timer.",
      },
      {
        scene: "Friend request",
        title: "A copied friend account appears",
        body:
          "Soon after, a profile with her friend's photo asks for help buying something fast. Lina notices the username has extra letters and the message sounds unlike her friend.",
        visual: "Two similar profiles side by side, with tiny name differences circled.",
      },
      {
        scene: "Security trick",
        title: "The OTP code trap",
        body:
          "Lina receives a login code, then someone claims to be 'security' and asks for that code to verify ownership. Lina remembers one-time codes are private keys.",
        visual: "A text bubble saying 'Send your code now' next to a locked shield.",
      },
      {
        scene: "Fake support",
        title: "The help-desk scam fails",
        body:
          "A fake support account asks for Lina's password to 'fix everything.' Lina reports the account, blocks it, and contacts support from the official app page instead.",
        visual: "A fake badge fading out while an official support page is open.",
      },
    ],
  },
];

export function getStoryChapter(slug) {
  return STORY_CHAPTERS.find((chapter) => chapter.slug === slug) || null;
}

export function getStoryChapterByGameHref(href) {
  return STORY_CHAPTERS.find((chapter) => chapter.relatedGame?.href === href) || null;
}
