import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CAPACITOR_BUILD=1 builds a static copy into client/out for the iOS app.
// Normal builds (Vercel) are unchanged.
const isCapacitor = process.env.CAPACITOR_BUILD === "1";

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  ...(isCapacitor && {
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
