import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reconecte",
  description: "Desafios terapêuticos para reconectar seu relacionamento",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reconecte",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A0A2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${poppins.className} h-full bg-[#0E0618] flex items-start justify-center`}>
        <div id="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
