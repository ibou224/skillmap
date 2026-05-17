/**
 * @module app/layout
 * @description Layout racine — obligatoire Next.js, contient html + body.
 */

import "./globals.css";

export const metadata = {
  title: "SkillMap",
  description: "Gestion des CV et affectations ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}