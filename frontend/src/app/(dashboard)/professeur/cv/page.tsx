/**
 * @module professeur/cv/page
 * @description Page CV du professeur.
 * Server Component — délègue le rendu à CvStatusSection.
 */

import CvStatusSection from "../sections/cvStatusSection";

export default function CvPage() {
  return <CvStatusSection />;
}