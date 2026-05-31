-- Drop the legacy programId column from Course
-- The many-to-many relation is handled by _CourseToProgram
ALTER TABLE "Course" DROP COLUMN IF EXISTS "programId";