export const metadata = { title: "India News — Auto-Scroll" };

import { Noto_Sans } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans({ weight: "900", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={noto.className}>{children}</body>
    </html>
  );
}
