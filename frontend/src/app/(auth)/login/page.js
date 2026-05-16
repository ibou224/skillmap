import LoginForm from '@/components/homePage/LoginForm.jsx';
import Image from 'next/image';
import FooterLog from '@/components/layout/Footer.jsx';
import { FileCheck2, Layers3, ShieldCheck, Globe } from 'lucide-react';

const features = [
    { icon: FileCheck2, label: 'CVs centralisés et structurés' },
    { icon: Layers3, label: 'Compétences cartographiées par IA' },
    { icon: ShieldCheck, label: 'Accès sécurisé par rôle' },
];

export default function LoginPage() {
    return (
        <div className="flex min-h-screen">

            {/* ── Panneau gauche — branding (desktop uniquement) ── */}
            <div className="relative hidden lg:flex lg:w-[46%] flex-col items-center justify-center gap-10 overflow-hidden py-12 px-10">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(/images/background.jpg)' }}
                />
                <div className="absolute inset-0 bg-[#0d2b25]/90" />
                <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-cite-green/20 blur-3xl pointer-events-none" />
                <div className="absolute -top-32 right-0 size-72 rounded-full bg-cite-green-light/10 blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-3 animate-[fadeInLeft_0.5s_ease_both]">
                    <Image
                        src="/images/logo-blanc.png"
                        alt="SkillMap"
                        width={36}
                        height={36}
                        style={{ width: 'auto', height: '36px' }}
                    />
                    <span className="text-base font-bold tracking-wide text-white">SkillMap</span>
                </div>

                {/* Accroche + fonctionnalités */}
                <div className="relative z-10 max-w-xs text-center animate-[fadeInLeft_0.6s_ease_0.1s_both]">
                    <h1 className="text-4xl font-extrabold leading-tight text-white">
                        Valorisez chaque compétence
                    </h1>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                        Gérez les CV du corps professoral, détectez les compétences par IA
                        et optimisez les affectations de cours — tout en un.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 text-left">
                        {features.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cite-green/30">
                                    <Icon className="size-4 text-cite-green-light" />
                                </span>
                                <span className="text-sm font-medium text-white/85">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Panneau droit — formulaire ── */}
            <div className="relative flex flex-1 flex-col px-4 py-10">
                {/* Bouton de changement de langue */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cite-green/50 backdrop-blur-sm">
                        <Globe className="size-4" />
                        <span>FR | EN</span>
                    </button>
                </div>

                {/* Fond clair sur desktop */}
                <div className="absolute inset-0 -z-10 hidden lg:block bg-[#f4f7f5]" />
                {/* Image de fond sur mobile */}
                <div
                    className="absolute inset-0 -z-10 bg-cover bg-center lg:hidden"
                    style={{ backgroundImage: 'url(/images/background.jpg)', opacity: 0.7 }}
                />

                {/* Contenu centré — séparé du footer pour que justify-center fonctionne */}
                <div className="flex flex-1 flex-col items-center justify-center gap-6">
                    {/* Logo mobile */}
                    <div className="lg:hidden text-center">
                        <Image
                            src="/images/logo_connexion.png"
                            alt="Collège La Cité"
                            width={160}
                            height={160}
                            style={{ width: 'auto', height: 'auto' }}
                            className="mx-auto mb-3 object-contain"
                            priority
                            loading="eager"
                        />
                        <p className="text-sm font-medium text-gray-800">
                            Plateforme de gestion des CV — Collège La Cité
                        </p>
                    </div>

                    {/* Formulaire */}
                    <div className="w-full max-w-md">
                        <LoginForm />
                    </div>

                    {/* Badges mobile (sous le formulaire) */}
                    <div className="flex flex-wrap justify-center gap-2 lg:hidden">
                        {features.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 backdrop-blur-sm"
                            >
                                <Icon className="size-3.5 text-cite-green-dark" />
                                <span className="text-xs font-semibold text-[#243f3a]">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer — toujours en bas, hors du bloc centré */}
                <div className="pt-6 w-full text-center">
                    <div className="lg:hidden backdrop-blur-md bg-white/50 rounded-xl py-3 px-4">
                        <FooterLog />
                    </div>
                    <div className="hidden lg:block">
                        <FooterLog />
                    </div>
                </div>
            </div>

        </div>
    );
}
