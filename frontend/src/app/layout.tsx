import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adctor — AI Crawler Monetization",
  description: "Turn AI crawler traffic into revenue",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body>{children}</body>
    </html>
  );
}
