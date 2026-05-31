/**
 * @module components/professeur/formations/FormationList
 * @description Liste d'affichage des formations et certifications (lecture seule).
 */

import { GraduationCap, Award } from "lucide-react";

/** Indique si une formation est une certification. */
const isCert = (f) => f.niveauDiplome === "CERTIFICATION";

/**
 * Liste des formations et certifications.
 * @param {Object} props
 * @param {Array<Object>} props.formations - Formations à afficher.
 * @param {string} [props.emptyMessage] - Message si la liste est vide.
 * @returns {JSX.Element} La liste des formations.
 */
export default function FormationList({ formations, emptyMessage = "Aucune formation renseignée." }) {
  if (!formations || formations.length === 0) {
    return <p className="text-xs text-slate-300">{emptyMessage}</p>;
  }

  const diplomes = formations.filter((f) => !isCert(f));
  const certs    = formations.filter((f) =>  isCert(f));

  return (
    <div>
      {diplomes.map((f, i) => (
        <div
          key={`d-${i}`}
          className="flex items-start gap-3.5 py-3.5 border-b border-slate-100 last:border-0 last:pb-0 first:pt-0"
        >
          <div className="w-9 h-9 rounded-[10px] bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-slate-800">{f.diplome}</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5 font-light">{f.etablissement}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">{f.anneeObtention}</p>
          </div>
        </div>
      ))}

      {certs.length > 0 && (
        <>
          {diplomes.length > 0 && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-1">
              Certifications
            </p>
          )}
          {certs.map((f, i) => (
            <div
              key={`c-${i}`}
              className="flex items-start gap-3.5 py-3.5 border-b border-slate-100 last:border-0 last:pb-0"
            >
              <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-slate-800">{f.diplome}</p>
                {f.etablissement && (
                  <p className="text-[11.5px] text-slate-400 mt-0.5 font-light">{f.etablissement}</p>
                )}
                {f.anneeObtention ? (
                  <p className="text-[11px] text-blue-500 font-medium mt-1">{f.anneeObtention}</p>
                ) : null}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}