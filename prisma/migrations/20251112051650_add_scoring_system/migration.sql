-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PUBLISHED', 'WITHDRAWN', 'FLAGGED');

-- CreateTable
CREATE TABLE "BuildingSubmission" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PUBLISHED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "eloRating" INTEGER NOT NULL DEFAULT 1500,
    "totalComparisons" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuildingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "submissionAId" TEXT NOT NULL,
    "submissionBId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonTag" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "side" TEXT NOT NULL,

    CONSTRAINT "ComparisonTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionTag" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "SubmissionTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildingSubmission_productId_idx" ON "BuildingSubmission"("productId");

-- CreateIndex
CREATE INDEX "BuildingSubmission_userId_idx" ON "BuildingSubmission"("userId");

-- CreateIndex
CREATE INDEX "BuildingSubmission_status_idx" ON "BuildingSubmission"("status");

-- CreateIndex
CREATE INDEX "BuildingSubmission_publishedAt_idx" ON "BuildingSubmission"("publishedAt");

-- CreateIndex
CREATE INDEX "BuildingSubmission_eloRating_idx" ON "BuildingSubmission"("eloRating");

-- CreateIndex
CREATE INDEX "Comparison_submissionAId_idx" ON "Comparison"("submissionAId");

-- CreateIndex
CREATE INDEX "Comparison_submissionBId_idx" ON "Comparison"("submissionBId");

-- CreateIndex
CREATE INDEX "Comparison_userId_idx" ON "Comparison"("userId");

-- CreateIndex
CREATE INDEX "Comparison_createdAt_idx" ON "Comparison"("createdAt");

-- CreateIndex
CREATE INDEX "ComparisonTag_comparisonId_idx" ON "ComparisonTag"("comparisonId");

-- CreateIndex
CREATE INDEX "ComparisonTag_submissionId_tag_idx" ON "ComparisonTag"("submissionId", "tag");

-- CreateIndex
CREATE INDEX "SubmissionTag_tag_idx" ON "SubmissionTag"("tag");

-- CreateIndex
CREATE INDEX "SubmissionTag_count_idx" ON "SubmissionTag"("count");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionTag_submissionId_tag_key" ON "SubmissionTag"("submissionId", "tag");

-- AddForeignKey
ALTER TABLE "BuildingSubmission" ADD CONSTRAINT "BuildingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingSubmission" ADD CONSTRAINT "BuildingSubmission_productId_fkey" FOREIGN KEY ("productId") REFERENCES "BuildingProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_submissionAId_fkey" FOREIGN KEY ("submissionAId") REFERENCES "BuildingSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_submissionBId_fkey" FOREIGN KEY ("submissionBId") REFERENCES "BuildingSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "BuildingSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonTag" ADD CONSTRAINT "ComparisonTag_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionTag" ADD CONSTRAINT "SubmissionTag_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "BuildingSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
