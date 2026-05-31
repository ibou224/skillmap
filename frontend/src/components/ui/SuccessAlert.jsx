/**
 * @module components/ui/SuccessAlert
 * @description Message de succès affiché après une action réussie.
 */

import React from 'react';
import { CheckCircle2, X,Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * Affiche un message de succès avec option de copie si nécessaire.
 *
 * @param {Object} props - Propriétés du composant.
 * @param {string} props.message - Message principal.
 * @param {Function} props.onClose - Ferme l'alerte.
 * @param {string} [props.password] - Mot de passe affiché en complément.
 * @param {string} [props.email] - Email affiché en complément.
 * @returns {JSX.Element} Alerte de succès.
 */
export default function SuccessAlert({ message , onClose,password,email }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if(password && email) {
            const textToCopy = `Email : ${email}\nMot de passe : ${password}`;
            navigator.clipboard.writeText(textToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
    <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm w-full relative">
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
                    {(password && email) && (
                        <div className="mt-3 flex items-center gap-2 bg-white border border-green-100 p-2 rounded-lg">
                            <div className="text-sm font-mono text-gray-800 flex-1 space-y-1">
                            <div>
                                <span className="text-gray-400 select-none">Email : </span>
                                <span className="font-bold">{email}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 select-none">MDP : </span>
                                <span className="font-bold tracking-wider">{password}</span>
                            </div>
                        </div>
                            
                            <button 
                            onClick={handleCopy}
                            className={`p-1.5 rounded-md transition-colors ${
                                    isCopied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Copier les identifiants">
                                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="text-green-600 hover:text-green-800 p-1">
                    <X className="w-4 h-4" />
                </button>
    </div>
    ); 
}
