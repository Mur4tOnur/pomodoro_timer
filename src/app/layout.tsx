import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FOCUS",
  description:
    "A minimal glassmorphism focus timer with session settings and ambient soundscapes.",
  applicationName: "FOCUS",
  openGraph: {
    title: "FOCUS",
    description:
      "Focus sessions with a reliable timer, session counter, and ambient beds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
