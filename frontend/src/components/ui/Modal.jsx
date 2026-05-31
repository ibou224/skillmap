/**
 * @module components/ui/Modal
 * @description Fenêtre modale générique avec overlay et titre.
 */

/**
 * Modale générique.
 * @param {Object} props
 * @param {boolean} props.isOpen - Affiche la modale si vrai.
 * @param {Function} props.onClose - Callback de fermeture (clic sur l'overlay).
 * @param {string} props.title - Titre de la modale.
 * @param {React.ReactNode} props.children - Contenu de la modale.
 * @returns {JSX.Element|null} La modale, ou null si fermée.
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
