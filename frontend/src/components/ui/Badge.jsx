export default function Badge({ label, color = 'gray' }) {
  return <span className={`badge badge-${color}`}>{label}</span>;
}
