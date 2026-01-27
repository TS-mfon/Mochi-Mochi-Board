import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Mochi Board",
  description: "AI Knowledge Base for Crypto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
