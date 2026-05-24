/**
 * @module components/sections/SessionSection
 * @description Section de gestion des sessions academiques.
 * @returns {ReactNode} Section de gestion des sessions
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarRange,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { Button } from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";
import SessionTable from "@/components/sessions/SessionTable";
import AddSessionForm from "@/components/sessions/addSessionForm";

export default function SessionSection() {
  const {
    sessions,
    pagination,
    isLoading,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  } = useSessions();

  // ── ÉTATS UI ──
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ search: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // ── DONNÉES FORM ──
  const [formData, setFormData] = useState({
    nom: "",
    saison: "",
    annee: "",
    dateDebut: "",
    dateFin: "",
  });

  // ═══════════════════════════════════════
  //  EFFECTS
  // ═══════════════════════════════════════

  useEffect(() => {
    if (!successMessage) return;
    const time = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(time);
  }, [successMessage]);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm]);


  // ═══════════════════════════════════════
  //  VALEURS DÉRIVÉES & HANDLERS
  // ═══════════════════════════════════════
useEffect(() => {
  const timer = setTimeout(() => {
    setCurrentPage(1);
    fetchSessions({ ...filters, page: 1, limit: itemsPerPage });
  }, 500);
  return () => clearTimeout(timer);
}, [filters.search]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSessions({ ...filters, page: newPage, limit: itemsPerPage });
  };

  // ═══════════════════════════════════════
  //  HANDLERS
  // ═══════════════════════════════════════

  const openCreate = () => {
    setEditingSession(null);
    setFormData({ nom: "", saison: "", annee: "", dateDebut: "", dateFin: "" });
    setLocalError("");
    setShowForm(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    const parts = session.nom ? session.nom.split(" ") : [];
    const saison = parts[0] || "";
    const annee = parts[1] || "";
    setFormData({
      nom: session.nom || "",
      saison,
      annee,
      dateDebut: session.dateDebut ? session.dateDebut.split("T")[0] : "",
      dateFin: session.dateFin ? session.dateFin.split("T")[0] : "",
    });
    setLocalError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    const payload = {
      nom: formData.nom,
      dateDebut: formData.dateDebut || null,
      dateFin: formData.dateFin || null,
      saison: formData.saison,
      annee: formData.annee,
    };

    try {
      if (editingSession) {
        const result = await updateSession(editingSession.id, payload);
        if (!result.success) {
          setLocalError(result.message || "Erreur lors de la modification.");
          return;
        }
        setSuccessMessage(`Session "${payload.nom}" modifiée avec succès.`);
      } else {
        const result = await createSession(payload);
        if (!result.success) {
          setLocalError(result.message || "Erreur lors de la création.");
          return;
        }
        setSuccessMessage(`Session "${payload.nom}" créée avec succès.`);
      }
      setShowForm(false);
      await fetchSessions();
    } catch (err) {
      setLocalError(err.message || "Une erreur inattendue s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteSession(sessionToDelete.id);
      if (!result.success) {
        setLocalError(result.message || "Erreur lors de la suppression.");
        return;
      }
      setSessionToDelete(null);
      setSuccessMessage(
        `Session "${sessionToDelete.nom}" supprimée avec succès.`,
      );
      await fetchSessions();
    } catch (err) {
      setLocalError(err.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };
  const isEditing = !!editingSession;

  return (
    <div>
      <div className="space-y-6 w-full mx-auto pb-10">
        {/* ALERTE SUCCÈS */}
        <div className="fixed left-1/2 -translate-x-1/2 top-4 w-full max-w-md z-50 space-y-2">
          {successMessage && (
            <SuccessAlert
              message={successMessage}
              onClose={() => setSuccessMessage("")}
            />
          )}
        </div>

        {/* ── EN-TÊTE ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cite-green to-[#135d55] rounded-3xl p-8 sm:p-10 shadow-lg border border-teal-600/30">
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 -translate-y-8 translate-x-12 w-64 h-64 border-[30px] border-white/5 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-32 translate-y-16 w-48 h-48 border-[20px] border-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <CalendarRange className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sessions
                </h1>
                {!isLoading && pagination.total > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                    {pagination.total} session{pagination.total !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm font-medium">
                Périodes académiques et calendrier scolaire
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {/* Recherche */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                  <input
                    type="text"
                    className="pl-9 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all w-80"
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                  />
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-white text-cite-green font-bold hover:bg-white/90 transition-colors px-5 py-2.5 rounded-xl shadow-md text-sm whitespace-nowrap"
              >
                <PlusCircle size={15} /> Ajouter une session
              </button>
            </div>
          </div>
        </div>

        {/* ── AFFICHAGE PRINCIPAL ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-indigo-500">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium text-slate-500">
              Chargement des sessions...
            </p>
          </div>
        ) : (
          <SessionTable
            sessions={sessions}
            onEdit={openEdit}
            onDelete={(s) => setSessionToDelete(s)}
          />
        )}

        {/* ── PAGINATION ── */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="bg-white border border-gray-100 px-5 py-3 rounded-2xl flex items-center justify-between shadow-sm">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              {" – "}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * itemsPerPage, pagination.total)}
              </span>
              {" sur "}
              <span className="font-semibold text-gray-700">
                {pagination.total}
              </span>{" "}
              sessions
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`min-w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                    currentPage === i + 1
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.totalPages, currentPage + 1),
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALE FORMULAIRE ── */}
      <AddSessionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        isLoading={isSubmitting}
        error={localError}
        onErrorClose={() => setLocalError("")}
      />

      {/* ── MODALE CONFIRMATION SUPPRESSION ── */}
      <ConfirmModal
        isOpen={sessionToDelete !== null}
        title="Supprimer la session"
        message={`Êtes-vous sûr de vouloir supprimer la session "${sessionToDelete?.nom}" ? Les groupes associés seront également supprimés.`}
        onConfirm={handleDelete}
        onCancel={() => setSessionToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
