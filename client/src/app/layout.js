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
      <body className="h-full bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <AuthProvider>
            <AuthGuard>
              <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex flex-1 flex-col">
                  <Topbar />

                  <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-6 md:px-8">
                    <div className="mx-auto max-w-6xl">{children}</div>
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
