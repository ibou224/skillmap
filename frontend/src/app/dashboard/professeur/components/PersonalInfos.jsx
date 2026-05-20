import { User, Mail, Phone, MapPin, Link2, Globe } from "lucide-react";


function FieldRow({ icon: Icon, label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(134,35%,45%)] transition bg-white";

export default function PersonalInfos({ data, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="px-6 pt-6 pb-2">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1">
        Informations personnelles
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldRow
          icon={User}
          label="Prénom"
          value={data.prenom}
          onChange={(v) => update("prenom", v)}
          placeholder="Jean"
        />
        <FieldRow
          icon={User}
          label="Nom"
          value={data.nom}
          onChange={(v) => update("nom", v)}
          placeholder="Dupont"
        />
        <FieldRow
          icon={Mail}
          label="Email"
          type="email"
          value={data.email}
          onChange={(v) => update("email", v)}
          placeholder="jean.dupont@email.com"
        />
        <FieldRow
          icon={Phone}
          label="Téléphone"
          type="tel"
          value={data.telephone}
          onChange={(v) => update("telephone", v)}
          placeholder="613-555-0192"
        />
        <FieldRow
          icon={MapPin}
          label="Ville / Région"
          value={data.ville}
          onChange={(v) => update("ville", v)}
          placeholder="Montréal, QC"
        />
        <FieldRow
          icon={Link2}
          label="LinkedIn"
          value={data.linkedin}
          onChange={(v) => update("linkedin", v)}
          placeholder="linkedin.com/in/jean-dupont"
        />

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
            <Globe className="w-3 h-3" /> Site web
          </label>
          <input
            placeholder="https://monportfolio.com"
            value={data.siteWeb}
            onChange={(e) => update("siteWeb", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Résumé
          </label>
          <textarea
            rows={3}
            placeholder="Décrivez votre profil..."
            value={data.resume}
            onChange={(e) => update("resume", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}