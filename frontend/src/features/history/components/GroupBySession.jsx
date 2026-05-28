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