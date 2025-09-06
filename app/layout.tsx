// app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = { title: "India News — Auto-Scroll" };

const noto = Noto_Sans({ weight: "900", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={noto.className}>{children}</body>
    </html>
  );
}

// app/layout.tsx
export const metadata = { title: "India News — Auto-Scroll" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
