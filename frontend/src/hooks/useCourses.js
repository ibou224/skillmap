import { useState, useEffect } from "react";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => { setCourses(data); setLoading(false); });
  }, []);

  return { courses, loading };
}