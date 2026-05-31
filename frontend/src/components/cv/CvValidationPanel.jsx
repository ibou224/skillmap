/**
 * @module components/cv/CvValidationPanel
 * @description Panneau de validation/rejet d'un CV (placeholder).
 */

/**
 * Panneau de validation d'un CV.
 * @param {Object} props
 * @param {Object} props.cv - CV à valider.
 * @param {Function} props.onValidate - Callback de validation.
 * @param {Function} props.onReject - Callback de rejet.
 * @returns {JSX.Element} Le panneau de validation.
 */
export default function CvValidationPanel({ cv, onValidate, onReject }) {
  return <div className="cv-validation"></div>;
}
