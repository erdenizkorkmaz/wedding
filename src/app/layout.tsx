import type { Metadata } from "next";
import { Nanum_Brush_Script } from "next/font/google";
import "./globals.css";

const fontNanum = Nanum_Brush_Script({
  variable: "--font-nanum-brush-script",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyejin & Denny Wedding",
  description: "Welcome to Hyejin & Denny's Wedding",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/favicon.png',
      },
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
      </head>
      <body
        className={`${fontNanum.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
