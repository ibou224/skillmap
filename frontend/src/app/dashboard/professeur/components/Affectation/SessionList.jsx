// components/history/SessionList.jsx
import { SessionCard } from "./SessionCard"; // contient déjà la logique de chaque session

export function SessionList({ sessions, expanded, onToggle }) {
  return (
    <div className="space-y-3">
      {sessions.map(s => (
        <SessionCard
          key={s.id}
          session={s}
          isOpen={expanded === s.id}
          onToggle={() => onToggle(s.id)}
        />
      ))}
    </div>
  );
}