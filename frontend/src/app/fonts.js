/**
 * @module app/fonts
 * @description Déclaration des polices de l'application (locales et Google Fonts)
 * exposées sous forme de variables CSS, importées par le layout racine.
 */

import localFont from 'next/font/local';
import { Felipa } from "next/font/google";

export const poppins = localFont({
  src: [
    {
      path: './fonts/poppins.woff2',
      weight: '100 900',
    }
  ],
  variable: '--font-poppins',
  display: 'swap',
});

export const sora = localFont({
  src: [
    {
      path: './fonts/Sora.woff',
      weight: '100 900',
    }
  ],
  variable: '--font-sora',
  display: 'swap',
});

export const ysabeau = localFont({
  src: [
    {
      path: './fonts/YsabeauInfant-VariableFont_wght.woff',
      weight: '100 1000',
    }
  ],
  variable: '--font-ysabeau',
  display: 'swap',
});

export const quintessential = localFont({
  src: [
    {
      path: './fonts/Quintessential-Regular.woff',
      weight: '500',
    }
  ],
  variable: '--font-quintessential',
  display: 'swap',
});

export const felipa = Felipa({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-felipa",
  display: "swap",
});
