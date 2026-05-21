-- Make Course.programId nullable (FK was already dropped in previous migration)
-- This allows inserting courses without a direct programId reference;
-- use the _CourseToProgram join table for program associations instead.
ALTER TABLE "Course" ALTER COLUMN "programId" DROP NOT NULL;