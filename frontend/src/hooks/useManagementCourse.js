"use client";
import { useState, useCallback } from "react";
import { isValidString } from "@/lib/validation";

export function useManagementCourse() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erreur lors de la récupération des cours.");
        setIsLoading(false);
        return [];
      }
      setCourses(data.data ?? []);
      setIsLoading(false);
      return data.data ?? [];
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return [];
    }
  }, []);

  const createCourse = useCallback(async ({ nom, code, programIds, etape }) => {
    setError(null);
    setIsLoading(true);
    if (!isValidString(nom)) {
      setError("Nom invalide.");
      setIsLoading(false);
      return null;
    }
    try {
      const res = await fetch("/api/courses/Add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, code, programIds, etape }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erreur lors de la création.");
        setIsLoading(false);
        return null;
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const updateCourse = useCallback(async (id, updates) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erreur lors de la mise à jour.");
        setIsLoading(false);
        return null;
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const archiveCourse = useCallback(async (id) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Erreur lors de l'archivage.");
        setIsLoading(false);
        return false;
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  }, []);

  const restoreCourse = useCallback(async (id) => {
    return updateCourse(id, { isArchived: false });
  }, [updateCourse]);

  return { courses, error, isLoading, getCourses, createCourse, updateCourse, archiveCourse, restoreCourse };
}
