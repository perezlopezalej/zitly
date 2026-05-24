import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { playfair, dmSans } from "@/lib/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zitly — Sistema de reservas para negocios",
  description: "Gestiona las citas de tu negocio de forma sencilla. Reservas online 24/7, sin complicaciones.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Zitly — Sistema de reservas para negocios",
    description: "Gestiona las citas de tu negocio de forma sencilla. Reservas online 24/7, sin complicaciones.",
    url: "https://zitly.es",
    siteName: "Zitly",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Zitly — Sistema de reservas online",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zitly — Sistema de reservas para negocios",
    description: "Gestiona las citas de tu negocio de forma sencilla. Reservas online 24/7, sin complicaciones.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
