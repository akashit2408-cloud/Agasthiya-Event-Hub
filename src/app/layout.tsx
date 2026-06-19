import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileLayout from "@/components/layout/MobileLayout";

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
      <body>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
