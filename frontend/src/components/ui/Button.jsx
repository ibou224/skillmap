export default function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} className={}>
      {children}
    </button>
  );
}
