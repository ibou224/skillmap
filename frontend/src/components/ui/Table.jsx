/**
 * @module components/ui/Table
 * @description Tableau générique piloté par une description de colonnes.
 */

/**
 * Tableau de données simple.
 * @param {Object} props
 * @param {Array<{key: string, label: string}>} props.columns - Définition des colonnes.
 * @param {Array<Object>} props.data - Lignes de données (indexées par `key`).
 * @returns {JSX.Element} Le tableau.
 */
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
