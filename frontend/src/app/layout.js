import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { poppins, sora, ysabeau, quintessential, felipa } from "./fonts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Skillmap",
  description: "Gestion des CVs et affectations de cours",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${poppins.variable} ${sora.variable} ${ysabeau.variable} ${quintessential.variable} ${felipa.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
