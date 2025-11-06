import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "TrustOrTrap",
  description: "Cyber awareness PWA",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the saved theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var theme = localStorage.getItem('theme');
    if(theme === 'dark') document.documentElement.classList.add('dark');
    else if(theme === 'light') document.documentElement.classList.remove('dark');
  } catch(e){}
})();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
