import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astraguard — Trust verification for Stellar",
  description:
    "Continuous trust-verification and consumer-protection platform for the Stellar ecosystem."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
