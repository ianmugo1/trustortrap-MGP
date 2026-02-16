const passwordIncidents = [
  {
    id: "credential_stuffing",
    label: "Credential Stuffing Attempt",
    description:
      "Attackers tried leaked username-password pairs against your account.",
    baseProbability: 0.22,
    postureModifiers: {
      reusedPassword: 0.2,
      weakStrengthThreshold: 50,
      weakStrengthPenalty: 0.12,
      twoFactorEnabled: -0.15,
      breachMonitoringEnabled: -0.05,
    },
    severityRules: {
      low: { maxRisk: 39 },
      medium: { maxRisk: 69 },
      high: { maxRisk: 100 },
    },
    responses: [
      {
        id: "reset_password",
        label: "Reset to a unique strong password",
        costs: { energy: 20, coins: 0 },
        effects: { riskDelta: -18, moodDelta: 5, healthDelta: 3 },
      },
      {
        id: "enable_2fa_now",
        label: "Enable 2FA immediately",
        costs: { energy: 10, coins: 10 },
        effects: { riskDelta: -22, moodDelta: 3, healthDelta: 4 },
      },
      {
        id: "ignore",
        label: "Ignore for now",
        costs: { energy: 0, coins: 0 },
        effects: { riskDelta: 12, moodDelta: -8, healthDelta: -10 },
      },
    ],
  },
  {
    id: "breach_alert",
    label: "Data Breach Alert",
    description:
      "A service tied to your account appears in a breach disclosure.",
    baseProbability: 0.18,
    postureModifiers: {
      breachMonitoringEnabled: 0.08,
      monitoringOffDelayedPenalty: 0.16,
      reusedPassword: 0.1,
      twoFactorEnabled: -0.08,
    },
    severityRules: {
      low: { maxRisk: 34 },
      medium: { maxRisk: 64 },
      high: { maxRisk: 100 },
    },
    responses: [
      {
        id: "rotate_passwords",
        label: "Rotate affected passwords",
        costs: { energy: 25, coins: 0 },
        effects: { riskDelta: -20, moodDelta: 4, healthDelta: 4 },
      },
      {
        id: "lock_sessions",
        label: "Log out all active sessions",
        costs: { energy: 12, coins: 5 },
        effects: { riskDelta: -14, moodDelta: 2, healthDelta: 3 },
      },
      {
        id: "delay_action",
        label: "Delay until tomorrow",
        costs: { energy: 0, coins: 0 },
        effects: { riskDelta: 14, moodDelta: -6, healthDelta: -8 },
      },
    ],
  },
  {
    id: "brute_force_attempt",
    label: "Brute Force Login Attempt",
    description:
      "Repeated password guesses are being attempted on your account.",
    baseProbability: 0.2,
    postureModifiers: {
      weakStrengthThreshold: 45,
      weakStrengthPenalty: 0.16,
      reusedPassword: 0.08,
      twoFactorEnabled: -0.12,
    },
    severityRules: {
      low: { maxRisk: 44 },
      medium: { maxRisk: 74 },
      high: { maxRisk: 100 },
    },
    responses: [
      {
        id: "strengthen_password",
        label: "Create a longer passphrase",
        costs: { energy: 18, coins: 0 },
        effects: { riskDelta: -16, moodDelta: 3, healthDelta: 3 },
      },
      {
        id: "activate_2fa",
        label: "Add 2FA protection",
        costs: { energy: 10, coins: 10 },
        effects: { riskDelta: -20, moodDelta: 2, healthDelta: 4 },
      },
      {
        id: "do_nothing",
        label: "Do nothing",
        costs: { energy: 0, coins: 0 },
        effects: { riskDelta: 10, moodDelta: -5, healthDelta: -7 },
      },
    ],
  },
  {
    id: "account_takeover",
    label: "Account Takeover",
    description:
      "Suspicious access confirmed. Your account is partially compromised.",
    baseProbability: 0.1,
    postureModifiers: {
      highRiskThreshold: 70,
      highRiskPenalty: 0.2,
      reusedPassword: 0.14,
      twoFactorEnabled: -0.16,
      breachMonitoringEnabled: -0.06,
    },
    severityRules: {
      low: { maxRisk: 49 },
      medium: { maxRisk: 79 },
      high: { maxRisk: 100 },
    },
    responses: [
      {
        id: "full_lockdown",
        label: "Full account lockdown",
        costs: { energy: 30, coins: 15 },
        effects: { riskDelta: -26, moodDelta: -2, healthDelta: 6 },
      },
      {
        id: "recover_and_rotate",
        label: "Recover account and rotate credentials",
        costs: { energy: 25, coins: 10 },
        effects: { riskDelta: -22, moodDelta: 0, healthDelta: 5 },
      },
      {
        id: "minimal_response",
        label: "Only reset password once",
        costs: { energy: 8, coins: 0 },
        effects: { riskDelta: -6, moodDelta: -8, healthDelta: -10 },
      },
    ],
  },
];

export default passwordIncidents;
