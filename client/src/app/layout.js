import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import { ToastProvider } from "@/src/components/ui/ToastProvider";


export const metadata = { title: "TrustOrTrap" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}


