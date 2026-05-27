import { Check, AlertTriangle } from "lucide-react";

export function TotalIndicator({ total, isValid }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all ${
      isValid 
        ? "bg-emerald-50 border-emerald-200" 
        : "bg-red-50 border-red-200"
    }`}>
      {isValid ? (
        <Check className="w-5 h-5 text-emerald-600" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-500" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-bold ${isValid ? "text-emerald-700" : "text-red-700"}`}>
          Total : {total}%
        </p>
        <p className={`text-xs mt-0.5 ${isValid ? "text-emerald-600" : "text-red-600"}`}>
          {isValid 
            ? "La somme des poids est correcte (100%)" 
            : `La somme doit être exactement 100% (${total > 100 ? "trop" : "manque"} ${Math.abs(total - 100)}%)`
          }
        </p>
      </div>
      <div className="w-16 h-16 relative">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={isValid ? "#d1fae5" : "#fee2e2"}
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={isValid ? "#10b981" : "#ef4444"}
            strokeWidth="6"
            strokeDasharray={`${(total / 100) * 176} 176`}
            className="transition-all duration-500"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
          isValid ? "text-emerald-700" : "text-red-700"
        }`}>
          {total}%
        </span>
      </div>
    </div>
  );
}