import "./globals.css";
import { Providers } from "./providers";
import { AuthGuard } from "../components/AuthGuard";
import AppFrame from "../components/AppFrame";

export const metadata = {
  title: "TrustOrTrap",
  description: "Cyber Awareness PWA",
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
