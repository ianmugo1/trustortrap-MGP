import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export const metadata = { title: "TrustOrTrap" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="pb-12">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
