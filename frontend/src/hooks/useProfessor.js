import { useState, useCallback } from "react";

// URL de l'API d'extraction – idéalement dans une variable d'environnement
const EXTRACT_API_URL =
  process.env.NEXT_PUBLIC_EXTRACT_API_URL || "/api/extract-cv";

export function useCvs() {
  const [cvs, setCvs] = useState([]);
  const [isLoadingCvs, setIsLoadingCvs] = useState(false);
  const [cvsError, setCvsError] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [isLoadingAffectations, setIsLoadingAffectations] = useState(false);
  const [affectationsError, setAffectationsError] = useState(null);
  const [infos, setInfos] = useState(null);
  const [isLoadingInfos, setIsLoadingInfos] = useState(false);
  const [infosError, setInfosError] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchCvs = useCallback(async () => {
    setIsLoadingCvs(true);
    setCvsError(null);
    try {
      const response = await fetch("/api/cvs");
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const data = await response.json();
      setCvs(data);
    } catch (err) {
      setCvsError(err);
    } finally {
      setIsLoadingCvs(false);
    }
  }, []);

  const extractCV = useCallback(async (file) => {
    setIsExtracting(true);
    setExtractionError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setExtractionError(err);
      throw err;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const fetchAffectations = useCallback(async (professeurId) => {
    setIsLoadingAffectations(true);
    setAffectationsError(null);
    try {
      const response = await fetch(
        `/api/affectations?professeurId=${professeurId}`,
      );
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const { data } = await response.json();
      setAffectations(data);
    } catch (err) {
      setAffectationsError(err);
    } finally {
      setIsLoadingAffectations(false);
    }
  }, []);

  const fetchInfos = useCallback(async () => {
    setIsLoadingInfos(true);
    setInfosError(null);
    try {
      const response = await fetch("/api/professor/me");
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      const { data } = await response.json();
      setInfos(data);
    } catch (err) {
      setInfosError(err);
    } finally {
      setIsLoadingInfos(false);
    }
  }, []);

  const saveInfos = useCallback(async (updatedInfos) => {
    setIsSaving(true);
    setInfosError(null);
    try {
      const response = await fetch("/api/professor/cvs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInfos),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const { data } = await response.json();
      setInfos(data);
      return data;
    } catch (err) {
      setInfosError(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rh/professors");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const { data } = await res.json();
      setProfessors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère le profil CV complet d'un professeur depuis l'API de détail.
   * Retourne les tableaux complets (competences, experiences, formations, langues)
   * contrairement à getProfessorById qui ne retourne que les compteurs de la liste.
   */
  const fetchProfessorById = useCallback(async (id) => {
    if (!id) return null;
    const res = await fetch(`/api/rh/professors/${id}`);
    const json = await res.json();
    if (!res.ok || !json.success)
      throw new Error(json.message ?? "Erreur serveur.");
    return json.data;
  }, []);


    const fetchAnalytics = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/rh/analytics");
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const dataAnalytics  = await res.json();
        setData(dataAnalytics.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, []);

  return {
    cvs,
    isLoadingCvs,
    fetchProfessors,
    cvsError,
    refetchCvs: fetchCvs,
    affectations,
    isLoadingAffectations,
    affectationsError,
    fetchAffectations,
    infos,
    professors,
    loading,
    error,
    isLoadingInfos,
    infosError,
    fetchInfos,
    extractCV,
    isExtracting,
    extractionError,
    saveInfos,
    isSaving,
    fetchProfessorById,
    fetchAnalytics,
    data,
  };
}
