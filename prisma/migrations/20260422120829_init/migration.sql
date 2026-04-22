-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Bookmarked', 'Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted', 'Withdrawn', 'NoResponse');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FullTime', 'PartTime', 'Contract', 'Internship', 'Freelance', 'Temporary', 'NotSpecified');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('Remote', 'Hybrid', 'Onsite', 'NotSpecified');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "target_position" TEXT,
    "target_employment_date" TIMESTAMP(3),
    "target_salary" INTEGER,
    "email_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "parsed_text" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "job_position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'NotSpecified',
    "work_arrangement" "WorkArrangement" NOT NULL DEFAULT 'NotSpecified',
    "job_description" TEXT,
    "job_url" TEXT,
    "application_date" TIMESTAMP(3),
    "deadline_date" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'Bookmarked',
    "excitement_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "resume_id" UUID,
    "match_score" INTEGER NOT NULL,
    "match_summary" TEXT NOT NULL,
    "matching_skills" TEXT[],
    "missing_skills" TEXT[],
    "recommendation" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "resumes_profile_id_idx" ON "resumes"("profile_id");

-- CreateIndex
CREATE INDEX "applications_profile_id_idx" ON "applications"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "analyses_application_id_key" ON "analyses"("application_id");

-- CreateIndex
CREATE INDEX "analyses_application_id_idx" ON "analyses"("application_id");

-- CreateIndex
CREATE INDEX "analyses_resume_id_idx" ON "analyses"("resume_id");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
