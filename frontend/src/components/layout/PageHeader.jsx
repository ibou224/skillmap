export default function PageHeader({ title, subtitle }) {
  return (
    <header>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
