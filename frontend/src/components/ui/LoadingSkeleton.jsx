/**
 * @module components/ui/LoadingSkeleton
 * @description Squelette de chargement de page (placeholders animés).
 */

/**
 * Squelette de chargement composite pour une page de dashboard.
 * @returns {JSX.Element} La structure de placeholders.
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-40 rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="h-72" />
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
        </div>
      </div>
      <Skeleton className="h-56" />
      <Skeleton className="h-40" />
    </div>
  );
}

/**
 * Bloc placeholder animé unitaire.
 * @param {Object} props
 * @param {string} [props.className] - Classes de dimensions/forme.
 * @returns {JSX.Element} Le bloc squelette.
 */
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}
