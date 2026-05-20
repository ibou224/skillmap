/**
 * @module components/user/userCard
 * @description Carte d'affichage pour un utilisateur.
 */

"use client";

import { User, Mail, Shield, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ROLE_BADGE } from '@/constants/constantes';

/**
 * Composant UserCard
 * Affiche les informations essentielles d'un utilisateur sous forme de carte interactive et élégante.
 * Conçu pour s'intégrer dans une grille (grid) de type tableau de bord.
 *
 * @param {Object} props - Les propriétés du composant.
 * @param {Object} props.user - L'objet contenant les données de l'utilisateur (id, nom, prenom, email, role, estActif).
 * @param {Function} props.onDelete - Fonction de rappel déclenchée lors du clic sur le bouton de suppression.
 * @param {Function} props.onEdit - Fonction de rappel déclenchée lors du clic sur le bouton de modification.
 */
export default function UserCard({ user, onDelete, onEdit }) {

    // --- LOGIQUE DE PRÉSENTATION (UI LOGIC) ---

    const roleStyle = ROLE_BADGE[user?.role?.toUpperCase()];

    /**
     * Formate le nom complet (Prénom + Nom) avec une majuscule au début de chaque mot.
     * Gère gracieusement les données manquantes pour éviter les erreurs d'exécution.
     * * @param {Object} userObj - L'objet utilisateur.
     * @returns {String} Le nom complet formaté.
     */
    const formatFullName = (userObj) => {
        if (!userObj?.prenom && !userObj?.nom) return "Utilisateur non renseigné";
        
        const formatWord = (name) => {
            if (!name) return "";
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        };

        const prenom = formatWord(userObj.prenom);
        const nom = formatWord(userObj.nom);
        
        return `${prenom} ${nom}`.trim();
    };

    const initials = `${user?.prenom?.charAt(0) || ""}${user?.nom?.charAt(0) || ""}`.toUpperCase();

    // --- RENDU VISUEL (JSX) ---
    return (
        <div className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
            
            {/* ── HEADER VERT ── */}
            <div className="relative bg-linear-to-br from-cite-green to-[#135d55] p-5 overflow-hidden">
                {/* Cercles décoratifs */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

                {/* Badge statut (top-right) */}
                <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        user?.estActif
                            ? "bg-white/20 text-white border-white/30"
                            : "bg-orange-400/20 text-orange-200 border-orange-400/30"
                    }`}>
                        {user?.estActif
                            ? <><CheckCircle2 className="w-3 h-3" /> Actif</>
                            : <>⏸ Suspendu</>
                        }
                    </span>
                </div>

                {/* Avatar + Nom */}
                <div className="flex items-center gap-3 mt-3 relative z-10">
                    <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                        <span className="text-sm font-black text-white">{initials}</span>
                    </div>
                    <div>
                        <p className="text-base font-black text-white tracking-tight leading-tight">
                            {user?.prenom} {user?.nom}
                        </p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 mt-2 relative z-10">
                    <Mail className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span className="text-xs text-white/60 truncate">{user?.email || "Aucun email"}</span>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="p-4 flex-1 flex flex-col gap-4">
                
                {/* Rôle et Statut */}
                <div className="space-y-2">
                    <div className='flex justify-between p-1 items-center'>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1 pr-2">
                            <Shield className="w-3 h-3" /> Rôle :
                            </p>
                         <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                            {roleStyle.label}
                        </p>
                    </div>
                    
                    <div className='p-1 flex justify-between items-center'>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Statut d&apos;accès
                        </p>
                        <p className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border ${
                            user?.estActif
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}>
                            {user?.estActif ? "🟢 Actif" : "⏸ Suspendu"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── FOOTER : ACTIONS ── */}
            <div className="p-4 border-t border-white/10 bg-white/50 flex gap-2">
                <button
                    onClick={onEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cite-green hover:bg-cite-green/90 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    title="Modifier"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    title="Supprimer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                </button>
            </div>

        </div>
    );
}
