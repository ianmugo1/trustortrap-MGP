import "./globals.css";
import { Providers } from "./providers";
import { AuthGuard } from "../components/AuthGuard";
import AppFrame from "../components/AppFrame";

export const metadata = {
  title: "TrustOrTrap",
  description: "Cyber Awareness PWA",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <AuthGuard>
            <AppFrame>{children}</AppFrame>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
