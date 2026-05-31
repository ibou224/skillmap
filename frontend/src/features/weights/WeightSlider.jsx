/**
 * @module features/weights/WeightSlider
 * @description Curseur (range) d'ajustement d'une pondération entre des bornes min/max.
 */

/**
 * Curseur d'édition d'une pondération.
 * @param {Object} props
 * @param {number} props.value - Valeur courante.
 * @param {Function} props.onChange - Callback de changement (reçoit un nombre).
 * @param {number} props.min - Borne minimale.
 * @param {number} props.max - Borne maximale.
 * @param {string} props.color - Classe de couleur du curseur.
 * @param {boolean} props.disabled - Désactive le curseur.
 * @returns {JSX.Element} Le curseur de pondération.
 */
export function WeightSlider({ value, onChange, min, max, color, disabled }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400">{min}%</span>
        <span className="text-[10px] text-slate-400">{max}%</span>
      </div>
    </div>
  );
}