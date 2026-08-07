import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Navbar from "./components/NavBar";

export const metadata: Metadata = {
  title: "ArchtypicA",
  description: "All the records all the time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full mx-auto max-w-6xl">
        <header className="mb-4">
            <Navbar />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 border-y border-border py-4">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          <p>
            &copy; 2026 Archtypica. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
