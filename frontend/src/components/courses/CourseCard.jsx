/**
 * @module components/courses/CourseCard
 * @description Carte compacte affichant un cours.
 */

/**
 * Carte d'affichage d'un cours.
 * @param {Object} props
 * @param {Object} props.course - Cours à afficher.
 * @returns {JSX.Element} La carte du cours.
 */
export default function CourseCard({ course }) {
  return <div className="course-card">{course?.nom}</div>;
}
