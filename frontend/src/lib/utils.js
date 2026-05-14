export function formatDate(date) {
  return new Date(date).toLocaleDateString("fr-CA");
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function scoreToPercent(score) {
  return Math.round(score * 100);
}