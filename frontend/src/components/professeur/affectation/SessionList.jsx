import { CourseRow } from "./CourseRow";

export function SessionList({ cours }) {
  return (
    <div className="divide-y divide-slate-50">
      {cours.map((c) => (
        <CourseRow key={c.code} cours={c} />
      ))}
    </div>
  );
}
