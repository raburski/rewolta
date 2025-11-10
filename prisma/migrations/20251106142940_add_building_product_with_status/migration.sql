-- CreateEnum
CREATE TYPE "BuildingProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "BuildingProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cdnUrl" TEXT NOT NULL,
    "status" "BuildingProductStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildingProduct_id_idx" ON "BuildingProduct"("id");

-- CreateIndex
CREATE INDEX "BuildingProduct_status_idx" ON "BuildingProduct"("status");
