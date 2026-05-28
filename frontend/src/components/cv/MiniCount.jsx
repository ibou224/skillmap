export default function MiniCount({ icon: Icon, value, color }) {
  if (value === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}>
      <Icon className="w-3 h-3" /> {value}
    </span>
  );
}