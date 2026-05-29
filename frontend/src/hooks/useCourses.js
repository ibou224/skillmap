'use client';

import { useState, useCallback } from 'react';
import { isValidString } from '@/lib/validation';

const DEFAULT_PAGINATION = { total: 0, page: 1, limit: 12, totalPages: 0 };

export function useCourses() {
  const [courses, setCourses]       = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);

  // ── Programmes ─────────────────────────────────────────────────────────────
  const fetchProgrammes = useCallback(async () => {
    try {
      const res  = await fetch('/api/courses?programs=true');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Erreur fetchProgrammes');
      setProgrammes(json.data ?? []);
      return json.data;
    } catch (err) {
      console.error('Erreur fetchProgrammes:', err);
      throw err;
    }
  }, []);

  // ── Cours ──────────────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resCourses, resProgrammes] = await Promise.all([
        fetch("/api/courses/"),
        fetch("/api/courses?programs=true"),
      ]);
      const [jsonCourses, jsonProgrammes] = await Promise.all([
        resCourses.json(),
        resProgrammes.json(),
      ]);

      if (!resCourses.ok    || !jsonCourses.success)    throw new Error(jsonCourses.error    ?? 'Erreur fetchCourses');
      if (!resProgrammes.ok || !jsonProgrammes.success) throw new Error(jsonProgrammes.error ?? 'Erreur fetchProgrammes');

      setCourses(jsonCourses.data ?? []);
      setProgrammes(jsonProgrammes.data ?? []);
      setPagination(DEFAULT_PAGINATION);
      return jsonCourses.data;
    } catch (err) {
      setError(err.message);
      console.error('Erreur fetchCourses:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Créer ──────────────────────────────────────────────────────────────────
  const createCourse = useCallback(async (courseData) => {
    setIsLoading(true);
    setError(null);

    const nomCheck   = isValidString(courseData?.nom ?? '');
    const etapeNum   = Number(courseData?.etape);
    const programIds = courseData?.programIds;
    const skillsIs   = courseData?.courseSkills?.map((cs) => { return { skillId: cs.skillId, niveauRequis: cs.niveauRequis, poidsCritique: cs.poidsCritique }; }) || [];

    if (
      !nomCheck.valid ||
      !courseData?.code ||
      !Number.isInteger(etapeNum) || etapeNum < 1 || etapeNum > 6 ||
      !Array.isArray(programIds) || programIds.length === 0
    ) {
      setIsLoading(false);
      const msg = !nomCheck.valid
        ? nomCheck.message
        : 'Veuillez remplir correctement tous les champs requis (nom, code, étape 1–6, au moins un programme).';
      setError(msg);
      return { success: false, message: msg };
    }

    try {
      const res  = await fetch('/api/courses/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nom:        courseData.nom.trim(),
          code:       String(courseData.code).trim(),
          etape:      etapeNum,
          programIds,
          courseSkills: skillsIs.map((s) => ({
            skillId:       s.skillId,
            niveauRequis:  s.niveauRequis  ?? 'DEBUTANT',
            poidsCritique: s.poidsCritique ?? 1,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Erreur création cours');

      setCourses(prev => [...prev, json.data]);
      return { success: true, data: json.data };
    } catch (err) {
      setError(err.message);
      console.error('Erreur createCourse:', err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Modifier ───────────────────────────────────────────────────────────────
  const updateCourse = useCallback(async (id, courseData) => {
    setIsLoading(true);
    setError(null);

    const nomCheck = isValidString(courseData?.nom ?? '');
    const etapeNum = Number(courseData?.etape);

    if (
      !id ||
      !nomCheck.valid ||
      !courseData?.code ||
      !Number.isInteger(etapeNum) || etapeNum < 1 || etapeNum > 6
    ) {
      setIsLoading(false);
      const msg = 'Tous les champs obligatoires doivent être valides.';
      setError(msg);
      return { success: false, message: msg };
    }

    try {
      const res  = await fetch(`/api/courses/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nom:   courseData.nom.trim(),
          code:  String(courseData.code).trim(),
          etape: etapeNum,
          ...(courseData.programIds ? { programIds: courseData.programIds } : {}),
          ...(courseData.courseSkills ? { courseSkills: courseData.courseSkills.map((s) => ({
            skillId:       s.skillId,
            niveauRequis:  s.niveauRequis  ?? 'DEBUTANT',
            poidsCritique: s.poidsCritique ?? 1,
          })) } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Erreur mise à jour cours');

      setCourses(prev => prev.map(c => c.id === id ? json.data : c));
      return { success: true, data: json.data };
    } catch (err) {
      setError(err.message);
      console.error('Erreur updateCourse:', err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Archiver ───────────────────────────────────────────────────────────────
  const deleteCourse = useCallback(async (id) => {
    if (!id) return { success: false, message: 'ID manquant.' };
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Erreur archivage cours');

      setCourses(prev => prev.filter(c => c.id !== id));
      return { success: true, data: json.data };
    } catch (err) {
      setError(err.message);
      console.error('Erreur deleteCourse:', err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Restaurer ──────────────────────────────────────────────────────────────
  const restoreCourse = useCallback(async (id) => {
    if (!id) return { success: false, message: 'ID manquant.' };
    setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/courses/${id}/restore`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Erreur restauration cours');

      setCourses(prev => prev.map(c => c.id === id ? json.data : c));
      return { success: true, data: json.data };
    } catch (err) {
      setError(err.message);
      console.error('Erreur restoreCourse:', err);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    programmes,
    pagination,
    isLoading,
    error,
    fetchCourses,
    fetchProgrammes,
    createCourse,
    updateCourse,
    deleteCourse,
    restoreCourse,
    setCourses,
    setProgrammes,
    setError,
  };
}
