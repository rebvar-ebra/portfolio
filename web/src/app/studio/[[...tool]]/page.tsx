import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Portfolio Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  redirect("https://studio.rebvar.xyz/");
}

