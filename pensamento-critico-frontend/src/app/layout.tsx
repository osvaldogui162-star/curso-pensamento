import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pensamento Crítico e Clareza Mental",
  description: "Plataforma de curso em pensamento crítico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${roboto.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
