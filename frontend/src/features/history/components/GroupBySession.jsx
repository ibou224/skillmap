/**
 * @module features/history/components/GroupBySession
 * @description Utilitaire de regroupement des affectations par session.
 */

/**
 * Regroupe une liste d'affectations par session.
 * @param {Array<Object>} assignments - Affectations à regrouper (chacune avec `.session`).
 * @returns {Array<{session: Object, assignments: Array<Object>}>} Groupes par session.
 */
export default function GroupBySession(assignments) {
  const groups = assignments.reduce((acc, assignment) => {
    const id = assignment.session.id;
    if (!acc[id]) {
      acc[id] = { session: assignment.session, assignments: [] };
    }
    acc[id].assignments.push(assignment);
    return acc;
  }, {});

  return Object.values(groups);
}