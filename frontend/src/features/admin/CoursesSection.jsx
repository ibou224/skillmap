"use client";

/**
 * @module features/admin/CoursesSection
 * @description Section de gestion des cours (admin) : liste paginée, filtres,
 * création/édition/archivage via {@link module:hooks/useCourses}.
 * @returns {ReactNode} La section de gestion des cours.
 */

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { CourseToolbar } from "@/components/courses/CourseToolbar";
import CourseTable from "@/components/courses/CourseTable";
import CourseForm from "@/components/courses/CourseForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";
import { useCourses } from "@/hooks/useCourses";

const DEFAULT_FORM = { nom: "", code: "", programIds: [], etape: 1, courseSkills: [] };
const PAGE_SIZE = 10;

export default function CoursesSection() {
  const {
    courses,
    programmes,
    error: hookError,
    fetchCourses,
    fetchProgrammes,
    createCourse,
    updateCourse,
    deleteCourse: archiveCourse,
    restoreCourse,
  } = useCourses();

  const getCourses = fetchCourses;

  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("tous");
  const [filterSkill, setFilterSkill]     = useState("tous");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [pendingArchiveId, setPendingArchiveId] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Timer sur les messages de succès
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    fetchCourses();
    fetchProgrammes();
  }, [fetchCourses, fetchProgrammes]);

  // Compétences uniques extraites des cours chargés
  const skillsFromCourses = [...new Map(
    courses.flatMap(c => c.courseSkills ?? [])
      .filter(cs => cs.skill)
      .map(cs => [cs.skillId, { id: cs.skillId, nom: cs.skill.nom }])
  ).values()].sort((a, b) => a.nom.localeCompare(b.nom));

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch  = `${c.nom} ${c.code ?? ""}`.toLowerCase().includes(q);
    const matchProgram = filterProgram === "tous" || c.programs?.some((p) => p.id === filterProgram);
    const matchSkill   = filterSkill   === "tous" || c.courseSkills?.some((cs) => cs.skillId === filterSkill);
    const matchArchive = showArchived ? c.isArchived : !c.isArchived;
    return matchSearch && matchProgram && matchSkill && matchArchive;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange      = (v) => { setSearch(v);        setPage(1); };
  const handleFilterChange      = (v) => { setFilterProgram(v); setPage(1); };
  const handleFilterSkillChange = (v) => { setFilterSkill(v);   setPage(1); };
  const handleToggleArchived    = ()  => { setShowArchived((v) => !v); setPage(1); };

  const openAdd = () => {
    setEditCourse(null);
    setFormData(DEFAULT_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (c) => {
    console.log("Open edit for course:", c);
    setEditCourse(c);
    setFormData({
      nom: c.nom ?? "",
      code: c.code ?? "",
      programIds: c.programs?.map((p) => p.id) ?? [],
      etape: c.etape ?? 1,
      courseSkills: c.courseSkills?.map((cs) => ({
        skillId:       cs.skillId,
        niveauRequis:  cs.niveauRequis  ?? 'DEBUTANT',
        poidsCritique: cs.poidsCritique ?? 1,
      })) ?? [],
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.nom?.trim()) {
      setFormError("Le nom du cours est requis.");
      return;
    }
    if (!formData.programIds?.length) {
      setFormError("Sélectionnez au moins un programme.");
      return;
    }
  

    const payload = {
      nom:          formData.nom.trim(),
      code:         formData.code?.trim() || undefined,
      programIds:   formData.programIds,
      etape:        Number(formData.etape),
      courseSkills: formData.courseSkills ?? [],
    };
    console.log("Submitting course data:", payload);

    const result = editCourse
      ? await updateCourse(editCourse.id, payload)
      : await createCourse(payload);

    if (result) {
      setShowModal(false);
      getCourses();
      setSuccessMessage(
        result.message ?? (editCourse ? "Cours mis à jour." : "Cours créé avec succès.")
      );
    } else {
      setFormError(hookError || "Une erreur est survenue.");
    }
  };

  const confirmArchive = async () => {
    const c = courses.find((c) => c.id === pendingArchiveId);
    setIsArchiving(true);
    await archiveCourse(pendingArchiveId);
    await getCourses();
    setIsArchiving(false);
    setPendingArchiveId(null);
    if (c) setSuccessMessage(`Le cours "${c.nom}" a été archivé.`);
  };

  const handleRestore = async (c) => {
    await restoreCourse(c.id);
    await getCourses();
    setSuccessMessage(`Le cours "${c.nom}" a été restauré.`);
  };

  return (
    <>
      <div className="space-y-6">
        <Banner
          title="Cours"
          description="Gestion des cours et de leurs programmes associés."
        />

        <CourseToolbar
          search={search}
          onSearchChange={handleSearchChange}
          filterProgram={filterProgram}
          programs={programmes}
          onFilterChange={handleFilterChange}
          filterSkill={filterSkill}
          skills={skillsFromCourses}
          onFilterSkillChange={handleFilterSkillChange}
          onAdd={openAdd}
          showArchived={showArchived}
          onToggleArchived={handleToggleArchived}
        />

        <CourseTable
          courses={paginated}
          onEdit={openEdit}
          onDelete={(id) => setPendingArchiveId(id)}
          onRestore={handleRestore}
          showArchived={showArchived}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">
              {filtered.length} cours — page {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="px-1 text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition
                        ${p === currentPage ? "bg-[hsl(134,35%,45%)] text-white" : "hover:bg-slate-100 text-slate-500"}`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OVERLAYS ET MODALES HORS DU FLUX space-y-6 */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-top-2">
          <SuccessAlert
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <CourseForm
            open={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={editCourse !== null}
            programmesList={programmes}
            error={formError}
            onErrorClose={() => setFormError("")}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={pendingArchiveId !== null}
        title="Archiver le cours"
        message={(() => {
          const c = courses.find((c) => c.id === pendingArchiveId);
          return c
            ? `Voulez-vous vraiment archiver "${c.nom}" ? Il ne sera plus disponible pour les affectations.`
            : "Voulez-vous vraiment archiver ce cours ?";
        })()}
        onConfirm={confirmArchive}
        onCancel={() => setPendingArchiveId(null)}
        isLoading={isArchiving}
      />
    </>
  );
}
