const cyberPetMiniGames = {
  trueFalse: {
    label: "True or False",
    reward: {
      correct: { riskDelta: -6, moodDelta: 3, healthDelta: 2 },
      incorrect: { riskDelta: 4, moodDelta: -3, healthDelta: -2 },
    },
    questions: [
      {
        id: "tf_01",
        prompt: "Using the same password across sites is safe if the password is long.",
        answer: false,
        explanation:
          "Password reuse is risky because one breach can expose all accounts sharing that password.",
      },
      {
        id: "tf_02",
        prompt: "Enabling 2FA can reduce the impact of leaked passwords.",
        answer: true,
        explanation:
          "2FA adds a second verification step, making account takeover harder.",
      },
      {
        id: "tf_03",
        prompt: "A short password with symbols is always stronger than a long passphrase.",
        answer: false,
        explanation:
          "Length is critical. Long unique passphrases are typically stronger than short complex strings.",
      },
      {
        id: "tf_04",
        prompt: "If breach monitoring alerts you, rotating passwords quickly lowers future risk.",
        answer: true,
        explanation:
          "Fast password rotation after alerts helps block credential stuffing attempts.",
      },
      {
        id: "tf_05",
        prompt: "Saving a password in plain text notes is a secure habit.",
        answer: false,
        explanation:
          "Plain text storage is insecure. Use a trusted password manager instead.",
      },
      {
        id: "tf_06",
        prompt: "Logging out suspicious sessions can help after unusual login activity.",
        answer: true,
        explanation:
          "Session lockdown reduces attacker persistence after suspicious access.",
      },
    ],
  },
  passwordStrengthener: {
    label: "Password Strengthener",
    reward: {
      correct: { riskDelta: -8, moodDelta: 3, healthDelta: 3 },
      incorrect: { riskDelta: 4, moodDelta: -2, healthDelta: -1 },
    },
    questions: [],
  },
  fillBlanks: {
    label: "Fill in the Blanks",
    reward: {
      correct: { riskDelta: -7, moodDelta: 3, healthDelta: 2 },
      incorrect: { riskDelta: 4, moodDelta: -2, healthDelta: -2 },
    },
    questions: [],
  },
};

export default cyberPetMiniGames;
