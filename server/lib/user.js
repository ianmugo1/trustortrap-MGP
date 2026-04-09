const DEFAULT_SETTINGS = {
  notifications: {
    app: true,
    email: true,
  },
  app: {
    theme: "system",
    language: "en",
    soundEffects: true,
  },
  system: {
    biometrics: false,
    autoLockMinutes: 5,
  },
};

const DEFAULT_MASTERY = {
  phishing: { answered: 0, correct: 0, accuracy: 0, level: "new", lastPracticedAt: null },
  passwords: { answered: 0, correct: 0, accuracy: 0, level: "new", lastPracticedAt: null },
  privacy: { answered: 0, correct: 0, accuracy: 0, level: "new", lastPracticedAt: null },
  aiSafety: { answered: 0, correct: 0, accuracy: 0, level: "new", lastPracticedAt: null },
  socialScams: { answered: 0, correct: 0, accuracy: 0, level: "new", lastPracticedAt: null },
};

const DEFAULT_STORY_PROGRESS = {
  completedSlugs: [],
  completedCount: 0,
  lastCompletedSlug: "",
  lastCompletedAt: null,
  chapters: [],
};

const DEFAULT_SHOP = {
  ownedItemIds: ["skin-classic", "theme-terminal", "badge-none"],
  equipped: {
    petSkin: "skin-classic",
    roomTheme: "theme-terminal",
    badge: "badge-none",
  },
};

export function sanitizeUser(user) {
  return {
    id: user._id,
    displayName: user.displayName,
    email: user.email,
    coins: user.coins || 0,
    xp: user.xp || 0,
    level: user.level || 1,
    learningInterest: user.learningInterest || "",
    phishingStats: user.phishingStats || {},
    socialStats: user.socialStats || {},
    cyberPetStats: user.cyberPetStats || {},
    mastery: {
      phishing: {
        ...DEFAULT_MASTERY.phishing,
        ...(user.mastery?.phishing || {}),
      },
      passwords: {
        ...DEFAULT_MASTERY.passwords,
        ...(user.mastery?.passwords || {}),
      },
      privacy: {
        ...DEFAULT_MASTERY.privacy,
        ...(user.mastery?.privacy || {}),
      },
      aiSafety: {
        ...DEFAULT_MASTERY.aiSafety,
        ...(user.mastery?.aiSafety || {}),
      },
      socialScams: {
        ...DEFAULT_MASTERY.socialScams,
        ...(user.mastery?.socialScams || {}),
      },
    },
    storyProgress: {
      ...DEFAULT_STORY_PROGRESS,
      ...(user.storyProgress || {}),
      completedSlugs: Array.isArray(user.storyProgress?.completedSlugs)
        ? user.storyProgress.completedSlugs
        : [],
      chapters: Array.isArray(user.storyProgress?.chapters)
        ? user.storyProgress.chapters
        : [],
    },
    shop: {
      ...DEFAULT_SHOP,
      ...(user.shop || {}),
      ownedItemIds: Array.isArray(user.shop?.ownedItemIds)
        ? [...new Set([...DEFAULT_SHOP.ownedItemIds, ...user.shop.ownedItemIds])]
        : DEFAULT_SHOP.ownedItemIds,
      equipped: {
        ...DEFAULT_SHOP.equipped,
        ...(user.shop?.equipped || {}),
      },
    },
    settings: {
      notifications: {
        app:
          user.settings?.notifications?.app ??
          DEFAULT_SETTINGS.notifications.app,
        email:
          user.settings?.notifications?.email ??
          DEFAULT_SETTINGS.notifications.email,
      },
      app: {
        theme: user.settings?.app?.theme ?? DEFAULT_SETTINGS.app.theme,
        language: user.settings?.app?.language ?? DEFAULT_SETTINGS.app.language,
        soundEffects:
          user.settings?.app?.soundEffects ??
          DEFAULT_SETTINGS.app.soundEffects,
      },
      system: {
        biometrics:
          user.settings?.system?.biometrics ??
          DEFAULT_SETTINGS.system.biometrics,
        autoLockMinutes:
          user.settings?.system?.autoLockMinutes ??
          DEFAULT_SETTINGS.system.autoLockMinutes,
      },
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
