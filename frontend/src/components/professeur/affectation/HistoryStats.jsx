/**
 * @module components/professeur/affectation/HistoryStats
 * @description Bande de statistiques de l'historique d'enseignement (professeur).
 */

import { Calendar, BookOpen, CheckCircle2, Layers } from "lucide-react";
import { StatCell } from "@/components/ui/StatCell";

/**
 * Statistiques résumées de l'historique du professeur.
 * @param {Object} props
 * @param {number} props.nbSessions - Nombre de sessions.
 * @param {number} props.nbCours - Nombre total de cours.
 * @param {number} props.nbFinalise - Nombre de cours finalisés.
 * @param {number} props.nbProgs - Nombre de programmes.
 * @returns {JSX.Element} La bande de statistiques.
 */
export function HistoryStats({ nbSessions, nbCours, nbFinalise, nbProgs }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCell icon={Calendar}     label="Sessions"   value={nbSessions}  />
      <StatCell icon={BookOpen}     label="Cours total" value={nbCours}    />
      <StatCell icon={CheckCircle2} label="Finalisés"  value={nbFinalise}  />
      <StatCell icon={Layers}       label="Programmes"  value={nbProgs}    />
    </div>
  );
}
