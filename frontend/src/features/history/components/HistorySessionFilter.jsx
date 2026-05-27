"use client";

export default function HistorySessionFilter({ sessions, selectedSession, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Session academique
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onChange("")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSession === ""
                ? "bg-cite-green text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes
          </button>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onChange(session.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedSession === session.id
                  ? "bg-cite-green text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {session.nom}
              {session.statut === "ACTIVE" && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
