import { useState, useEffect,useCallback, use } from 'react';
import { isValidString } from '@/lib/validation';

export default function useSkills() {
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Erreur lors de la récupération des compétences.");
        }
        setSkills(data.data);
        return data;
    } catch (err) {
      setError(err.message);
      console.error("Erreur fetchSkills:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return { skills, error, isLoading, fetchSkills };

}