import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reconecte",
  description: "Trilhas terapêuticas para reconectar relacionamentos",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-full bg-[#1A0A2E] flex items-start justify-center">
        <div id="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
