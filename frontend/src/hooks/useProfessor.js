import { useState, useCallback } from "react";

// URL de l'API d'extraction – idéalement dans une variable d'environnement
const EXTRACT_API_URL = process.env.NEXT_PUBLIC_EXTRACT_API_URL || "/api/extract-cv";

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
      const response = await fetch(EXTRACT_API_URL, {
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
      const response = await fetch(`/api/affectations?professeurId=${professeurId}`);
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
      const response = await fetch("/api/professor/me", {
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
    }finally {
      setIsSaving(false);
    }
  }, []);

  return {
    cvs,
    isLoadingCvs,
    cvsError,
    refetchCvs: fetchCvs,
    affectations,
    isLoadingAffectations,
    affectationsError,
    fetchAffectations,
    infos,
    isLoadingInfos,
    infosError,
    fetchInfos,
    extractCV,
    isExtracting,
    extractionError,
    saveInfos,
    isSaving,
  };
}