/**
 * @module components/cv/CvUploadForm
 * @description Formulaire d'upload de CV (placeholder).
 */

/**
 * Formulaire d'envoi de CV.
 * @param {Object} props
 * @param {Function} props.onUpload - Gestionnaire de soumission du formulaire.
 * @returns {JSX.Element} Le formulaire d'upload.
 */
export default function CvUploadForm({ onUpload }) {
  return <form onSubmit={onUpload}></form>;
}
