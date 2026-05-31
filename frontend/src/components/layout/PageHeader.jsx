/**
 * @module components/layout/PageHeader
 * @description En-tête de page simple avec titre et sous-titre optionnel.
 */

/**
 * En-tête de page.
 * @param {Object} props
 * @param {string} props.title - Titre de la page.
 * @param {string} [props.subtitle] - Sous-titre optionnel.
 * @returns {JSX.Element} L'en-tête.
 */
export default function PageHeader({ title, subtitle }) {
  return (
    <header>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
