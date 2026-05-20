"use client";

import { useState, useEffect } from "react";
import { Banner } from "@/components/Banner";
import { CourseToolbar } from "@/components/courses/CourseToolbar";
import CourseTable from "@/components/courses/CourseTable";
import CourseForm from "@/components/courses/CourseForm";
import { useManagementCourse } from "@/hooks/useManagementCourse";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SuccessAlert from "@/components/ui/SuccessAlert";

const DEFAULT_FORM = { nom: "", code: "", programIds: [], etape: 1 };

export default function CoursesSection() {
  const {
    courses,
    getCourses,
    createCourse,
    updateCourse,
    archiveCourse,
    restoreCourse,
    error: hookError,
  } = useManagementCourse();

  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("tous");
  const [showArchived, setShowArchived] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [pendingArchiveId, setPendingArchiveId] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  useEffect(() => {
    fetch("/api/courses?programs=true")
      .then((r) => r.json())
      .then((d) => setPrograms(d.data ?? []));
  }, []);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = `${c.nom} ${c.code ?? ""}`.toLowerCase().includes(q);
    const matchProgram =
      filterProgram === "tous" || c.programs?.some((p) => p.id === filterProgram);
    const matchArchive = showArchived ? c.isArchived : !c.isArchived;
    return matchSearch && matchProgram && matchArchive;
  });

  const openAdd = () => {
    setEditCourse(null);
    setFormData(DEFAULT_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCourse(c);
    setFormData({
      nom: c.nom ?? "",
      code: c.code ?? "",
      programIds: c.programs?.map((p) => p.id) ?? [],
      etape: c.etape ?? 1,
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
      nom: formData.nom.trim(),
      code: formData.code?.trim() || undefined,
      programIds: formData.programIds,
      etape: Number(formData.etape),
    };

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
    <div className="space-y-6">
      <Banner
        title="Cours"
        description="Gestion des cours et de leurs programmes associés."
      />

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <CourseToolbar
        search={search}
        onSearchChange={setSearch}
        filterProgram={filterProgram}
        programs={programs}
        onFilterChange={setFilterProgram}
        onAdd={openAdd}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived((v) => !v)}
      />

      <CourseTable
        courses={filtered}
        onEdit={openEdit}
        onDelete={(id) => setPendingArchiveId(id)}
        onRestore={handleRestore}
        showArchived={showArchived}
      />

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
            programmesList={programs}
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
    </div>
  );
}
