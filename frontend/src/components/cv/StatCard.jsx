export default function StatCard({ icon: Icon, label, value, colorIcon, colorBg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorBg}`}>
        <Icon className={`w-5 h-5 ${colorIcon}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800 tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}