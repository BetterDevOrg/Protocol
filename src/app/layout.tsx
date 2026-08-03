import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "betterdev — Meet Engineers. Build Real Connections.",
  description:
    "Join a decentralized network where meaningful relationships start offline.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "betterdev",
    description: "Decentralized global community of engineers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <meta
          name="impact-site-verification"
          value="4614aca4-91c9-4706-91b0-12dc29b5a89a"
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>{children}</body>
    </html>
  );
}
