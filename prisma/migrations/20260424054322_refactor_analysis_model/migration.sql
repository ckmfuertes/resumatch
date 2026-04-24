/*
  Warnings:

  - Added the required column `analyzed_job_description` to the `analyses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `analyzed_resume_text` to the `analyses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "analyses" ADD COLUMN     "analyzed_job_description" TEXT NOT NULL,
ADD COLUMN     "analyzed_resume_text" TEXT NOT NULL;
