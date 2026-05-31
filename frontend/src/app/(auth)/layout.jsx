/**
 * @module app/(auth)/layout
 * @description Layout du groupe de routes d'authentification (centre le contenu verticalement).
 */

/**
 * Layout des pages d'authentification.
 * @param {{ children: React.ReactNode }} props - Contenu de la page.
 * @returns {JSX.Element} Conteneur centré verticalement.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col justify-center" >
      {children}
    </div>
  );
}
