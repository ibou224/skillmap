import { useState, useEffect } from "react";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  return { users, loading };
}