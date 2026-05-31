/**
 * @module components/cv/CvCard
 * @description Carte compacte affichant un CV.
 */

/**
 * Carte d'affichage d'un CV.
 * @param {Object} props
 * @param {Object} props.cv - CV à afficher.
 * @returns {JSX.Element} La carte du CV.
 */
export default function CvCard({ cv }) {
  return <div className="cv-card">{cv?.nom}</div>;
}
