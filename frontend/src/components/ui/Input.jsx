export default function Input({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input id={name} name={name} type={type} value={value} onChange={onChange} />
    </div>
  );
}
