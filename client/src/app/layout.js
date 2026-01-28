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
                  <main className="flex-1 min-h-0 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 md:px-8 py-4">
                    <div className="mx-auto w-full max-w-6xl">
                      {children}
                    </div>
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
