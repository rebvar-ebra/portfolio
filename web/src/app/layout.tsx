import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Rebvar Studio",
  description: "Full-stack developer portfolio for Rebvar Ebrahimi in Berlin.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#071016",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
