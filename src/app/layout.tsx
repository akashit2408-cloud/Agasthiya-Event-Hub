import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import MobileLayout from "@/components/layout/MobileLayout";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DJ Eventer Chennai ERP",
  description: "Internal company operations and event planning",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
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
    <html lang="en">
      <body className={`${outfit.className} antialiased bg-gray-50`}>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
