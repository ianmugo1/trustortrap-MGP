import app, { initializeApp } from "./app.js";

const PORT = Number(process.env.PORT) || 5050;

(async () => {
  try {
    await initializeApp();

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
})();
