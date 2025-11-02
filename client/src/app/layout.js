import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";

export const metadata = { title: "TrustOrTrap" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
