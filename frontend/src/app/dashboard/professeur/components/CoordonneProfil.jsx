import { Mail, Phone, MapPin, Globe, Link2 } from "lucide-react";

export default function CoordonneProfil({ user }) {
  const initials = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Avatar */}
      <div className="text-center pb-5 mb-5 border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-400 to-emerald-700 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 select-none">
          {initials}
        </div>
        <p className="font-semibold text-slate-800 text-sm">
          {user.prenom} {user.nom}
        </p>
        <p className="text-[11px] text-slate-400 font-light mt-0.5">
          Professeure · Informatique
        </p>
      </div>

      <div className="space-y-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
          Coordonnées
        </p>
        <InfoRow icon={Mail} label="Email" value={user.email} />
        <InfoRow icon={Phone} label="Téléphone" value={user.telephone} />
        <InfoRow icon={MapPin} label="Ville" value={user.ville} />
        {user.siteWeb && (
          <InfoRow
            icon={Globe}
            label="Site web"
            value={user.siteWeb.replace("https://", "")}
          />
        )}
        {user.linkedin && (
          <InfoRow
            icon={Link2}
            label="LinkedIn"
            value={user.linkedin.replace("https://", "")}
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7.5 h-7.5 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-emerald-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-[12.5px] text-slate-700 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}