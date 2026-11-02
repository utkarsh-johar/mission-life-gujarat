import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "LiFE Gujarat — Citizen Engagement Platform | GEDA",
  description:
    "Official Mission LiFE (Lifestyle for Environment) citizen platform for Gujarat Energy Development Agency. Calculate carbon baseline in 30 seconds, map rooftop solar on satellite imagery, and track green mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-tealbrand-100 selection:text-tealbrand-900">
        <I18nProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
