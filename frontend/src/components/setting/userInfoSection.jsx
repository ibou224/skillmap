/**
 * @module components/setting/userInfoSection
 * @description Section qui affiche les informations du profil connecté.
 */

"use client";
import React from 'react';
import { User, Mail, UserCircle, BadgeCheck, Info } from 'lucide-react';
import { useUserInfo } from "@/hooks/useUserInfo";


/**
 * Affiche les informations de base du profil utilisateur.
 *
 * @returns {JSX.Element} Section d'informations utilisateur.
 */
export function UserInfoSection() {
    // Note : Dans un vrai projet, ces données viendraient de tes props ou d'un contexte
    const { user } = useUserInfo();

    return (
        <div className="max-w-3xl mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
            {/* Header avec zone d'avatar statique */}
            <div className="relative h-32 bg-gradient-to-r from-cite-green/20 to-blue-50">
                <div className="absolute -bottom-12 left-8">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={40} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 px-8 pb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Informations du Profil
                            <BadgeCheck className="text-cite-green w-5 h-5" />
                        </h1>
                        <p className="text-sm text-gray-500">Ces informations sont gérées par l'administration du collège.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Grille d'affichage Nom / Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 p-4 bg-gray-50 rounded-xl border border-transparent">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <UserCircle size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Nom</span>
                            </div>
                            <p className="text-gray-900 font-semibold pl-6">{user.nom}</p>
                        </div>

                        <div className="space-y-1.5 p-4 bg-gray-50 rounded-xl border border-transparent">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <UserCircle size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Prénom</span>
                            </div>
                            <p className="text-gray-900 font-semibold pl-6">{user.prenom}</p>
                        </div>
                    </div>

                    {/* Affichage Email */}
                    <div className="space-y-1.5 p-4 bg-gray-50 rounded-xl border border-transparent">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Mail size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Adresse Email académique</span>
                        </div>
                        <p className="text-gray-900 font-semibold pl-6">{user.email}</p>
                    </div>

                    {/* Note informative discrète */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 mt-4">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Si ces informations contiennent une erreur, veuillez contacter le service du registraire pour demander une mise à jour officielle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
