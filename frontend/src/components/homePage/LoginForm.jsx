"use client";

import React, { useState } from 'react';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/useAuth';

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login, error, isLoading } = useLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const passwordInputType = showPassword ? "text" : "password";

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/80 bg-white/92 shadow-[0_24px_70px_-32px_rgba(20,63,57,0.65)] backdrop-blur-xl animate-[fadeInUp_0.5s_ease_both]">
            {/* Barre d'accent SkillMap */}
            <div className="h-1 w-full bg-linear-to-r from-cite-green-dark via-cite-green to-cite-green-light" />

            <div className="p-6 sm:p-8">
                <div className="mb-7">
                    <p className="mb-2 text-3xl font-bold text-black text-center">
                        Connexion
                    </p>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#153c37]">
                        Bienvenue sur SkillMap
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#62736f]">
                        Connectez-vous pour accéder à votre espace de gestion des CV et des affectations.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#243f3a]">
                            Adresse e-mail
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#80918d]" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="prenom.nom@lacitec.on.ca"
                                className="h-12 w-full rounded-xl border border-[#dfe8e2] bg-[#f8faf7] px-4 pl-10 text-sm text-[#153c37] outline-none transition-all duration-200 placeholder:text-[#9aaba6] focus:border-cite-green/70 focus:bg-white focus:ring-4 focus:ring-cite-green/15"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <label htmlFor="password" className="block text-sm font-semibold text-[#243f3a]">
                                Mot de passe
                            </label>
                            <span className="text-xs font-medium text-[#7b8f89]">
                                Compte institutionnel
                            </span>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#80918d]" />
                            <input
                                type={passwordInputType}
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 w-full rounded-xl border border-[#dfe8e2] bg-[#f8faf7] px-4 pl-10 pr-12 text-sm text-[#153c37] outline-none transition-all duration-200 placeholder:text-[#9aaba6] focus:border-cite-green/70 focus:bg-white focus:ring-4 focus:ring-cite-green/15"
                            />
                            <button
                                type="button"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#80918d] transition-colors hover:bg-cite-green/10 hover:text-cite-green-dark focus:outline-none focus:ring-3 focus:ring-cite-green/20"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 animate-[shake_0.35s_ease-in-out]"
                        >
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-1 h-12 w-full cursor-pointer rounded-xl bg-cite-green text-sm font-bold tracking-wide text-white shadow-[0_14px_28px_-16px_rgba(75,154,94,0.85)] transition-all duration-200 hover:bg-cite-green-dark focus:ring-4 focus:ring-cite-green/20"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                                Connexion en cours...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Se connecter
                                <ArrowRight className="size-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
