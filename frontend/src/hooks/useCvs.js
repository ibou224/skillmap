import { useState, useEffect } from "react";

export function useCvs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cvs")
      .then((res) => res.json())
      .then((data) => { setCvs(data); setLoading(false); });
  }, []);

  return { cvs, loading };
}