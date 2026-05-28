import { Suspense } from "react";
import CvStatusSection from "@/features/professeur/cvStatutSection";

export default function CvPage() {
  return (
    <Suspense>
      <CvStatusSection />
    </Suspense>
  );
}