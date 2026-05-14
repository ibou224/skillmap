export default function Table({ columns, data }) {
  return (
    <table>
      <thead>
        <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>{columns.map((col) => <td key={col.key}>{row[col.key]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
