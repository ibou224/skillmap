/**
 * @module components/users/UserTable
 * @description Tableau des utilisateurs avec rôle, statut (actif/verrouillé) et
 * actions (éditer, supprimer, (dé)verrouiller).
 */

import { Edit2, Trash2, CheckCircle2, XCircle, GraduationCap, Shield, Users, LockKeyhole, LockKeyholeOpen } from "lucide-react";

/** Métadonnées d'affichage (label, couleur, icône) par rôle. */
const roleMeta = {
  admin:      { label: "ADMIN",      color: "bg-blue-100 text-blue-700",   icon: <Shield       className="w-3 h-3" /> },
  rh:         { label: "RH",         color: "bg-yellow-100 text-yellow-700", icon: <Users       className="w-3 h-3" /> },
  professeur: { label: "PROFESSEUR", color: "bg-green-100 text-green-700",  icon: <GraduationCap className="w-3 h-3" /> },
};

/** Retourne true si le compte est actuellement verrouillé (lockedUntil dans le futur). */
function isLocked(user) {
  return user.lockedUntil && new Date(user.lockedUntil) > new Date();
}

export function UserTable({ users, onToggleStatus, onEdit, onDelete, onUnlock }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Nom</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Rôle</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">CV</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Statut</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => {
              const rm      = roleMeta[u.role?.toLowerCase()] ?? { label: u.role ?? "—", color: "bg-gray-100 text-gray-600", icon: null };
              const locked  = isLocked(u);

              return (
                <tr key={u.id} className={`transition ${locked ? "bg-red-50/40" : "hover:bg-slate-50/40"}`}>
                  {/* Nom */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-[hsl(134,35%,45%)]">
                        {u.prenom[0]}{u.nom[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-gray-700">{u.prenom} {u.nom}</span>
                        {locked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
                            <LockKeyhole className="w-3 h-3" /> Compte verrouillé
                          </span>
                        )}
                        {!locked && u.loginAttempts > 0 && (
                          <span className="text-[10px] text-amber-500 font-medium">
                            {u.loginAttempts} tentative{u.loginAttempts > 1 ? "s" : ""} échouée{u.loginAttempts > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>

                  {/* Rôle */}
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${rm.color}`}>
                      {rm.icon} {rm.label}
                    </span>
                  </td>

                  {/* CV */}
                  <td className="px-5 py-3">
                    {u.cvUploaded
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <XCircle      className="w-4 h-4 text-slate-300" />}
                  </td>

                  {/* Statut */}
                  <td className="px-5 py-3">
                    <button
                      onClick={() => onToggleStatus(u.id)}
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg transition ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {u.isActive ? "Actif" : "Inactif"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex gap-2 items-center">
                      {/* Bouton déverrouiller — visible uniquement si le compte est bloqué */}
                      {locked && (
                        <button
                          onClick={() => onUnlock(u.id)}
                          title="Déverrouiller le compte"
                          className="text-red-400 hover:text-emerald-600 transition"
                        >
                          <LockKeyholeOpen className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(u)}
                        title="Modifier"
                        className="text-slate-400 hover:text-[hsl(134,35%,45%)] transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(u.id)}
                        title="Désactiver"
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-400">
        {users.length} utilisateur{users.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
