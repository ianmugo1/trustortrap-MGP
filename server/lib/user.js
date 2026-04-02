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

export function sanitizeUser(user) {
  return {
    id: user._id,
    displayName: user.displayName,
    email: user.email,
    coins: user.coins || 0,
    learningInterest: user.learningInterest || "",
    phishingStats: user.phishingStats || {},
    socialStats: user.socialStats || {},
    cyberPetStats: user.cyberPetStats || {},
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
