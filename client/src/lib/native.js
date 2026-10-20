import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const REMINDER_ID = 1;

// Daily 6pm Cyber Pet reminder. Only runs inside the iOS app.
export async function syncDailyReminder(enabled) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    if (!enabled) return;

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== "granted") return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "Your Cyber Pet needs you",
          body: "Answer today's 5 questions to keep your pet healthy.",
          schedule: { on: { hour: 18, minute: 0 }, allowWhileIdle: true },
        },
      ],
    });
  } catch (err) {
    console.error("Reminder setup failed", err);
  }
}
