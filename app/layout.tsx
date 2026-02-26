import type { Metadata } from "next";
import { Geist_Mono, Kodchasan } from "next/font/google";
import "./globals.css";

const kodchasan = Kodchasan({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kodchasan",
  subsets: ["latin", "thai"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | MC-Todo",
    default: "MC-Todo | Modern Task Management",
  },
  description:
    "A modern, high-performance To-Do List application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kodchasan.className} ${kodchasan.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
