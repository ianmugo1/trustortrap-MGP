import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Providers } from "./providers";
import { AuthProvider } from "../context/AuthContext";
import { AuthGuard } from "../components/AuthGuard";

export const metadata = {
  title: "TrustOrTrap",
  description: "Cyber Awareness PWA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-950 text-slate-100 antialiased overflow-hidden">
        <Providers>
          <AuthProvider>
            <AuthGuard>
              {/* FULL APP SHELL: locked to viewport */}
              <div className="flex h-[100dvh] overflow-hidden">
                <Sidebar />

                {/* RIGHT SIDE */}
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                  {/* Topbar stays fixed height */}
                  <Topbar />

                  {/* Only this area scrolls (if needed) */}
                  <main className="relative flex-1 min-h-0 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                    {/* yellow and blue polkadot background overlay */}
                    <div
                      className="fixed inset-0 pointer-events-none opacity-[0.07]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, #facc15 8px, transparent 8px), radial-gradient(circle, #3b82f6 8px, transparent 8px)",
                        backgroundSize: "60px 60px",
                        backgroundPosition: "0 0, 30px 30px",
                      }}
                    />
                    {children}
                  </main>
                </div>
              </div>
            </AuthGuard>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
