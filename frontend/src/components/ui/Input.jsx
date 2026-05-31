/**
 * @module components/ui/Input
 * @description Champ de saisie contrôlé avec libellé.
 */

/**
 * Champ de formulaire contrôlé avec label optionnel.
 * @param {Object} props
 * @param {string} [props.label] - Libellé du champ.
 * @param {string} props.name - Nom/id du champ.
 * @param {string} props.value - Valeur contrôlée.
 * @param {Function} props.onChange - Gestionnaire de changement.
 * @param {string} [props.type='text'] - Type d'input HTML.
 * @param {boolean} [props.required=false] - Champ obligatoire.
 * @param {string} [props.placeholder=''] - Texte indicatif.
 * @returns {JSX.Element} Le champ de saisie.
 */
export default function Input({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium leading-6 text-gray-900 mb-1">
          {label}
        </label>
      )}
      <div className="mt-2">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
        />
      </div>
    </div>
  );
}
