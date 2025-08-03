/*
  Warnings:

  - You are about to drop the column `googleDriveFileId` on the `generated_images` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveThumbnail` on the `generated_images` table. All the data in the column will be lost.
  - You are about to drop the column `googleDriveWebLink` on the `generated_images` table. All the data in the column will be lost.
  - You are about to drop the column `storageProvider` on the `generated_images` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "generated_images_storageProvider_idx";

-- AlterTable
ALTER TABLE "generated_images" DROP COLUMN "googleDriveFileId",
DROP COLUMN "googleDriveThumbnail",
DROP COLUMN "googleDriveWebLink",
DROP COLUMN "storageProvider";

-- CreateTable
CREATE TABLE "personal_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT 'pink',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personal_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_events_userId_idx" ON "personal_events"("userId");

-- AddForeignKey
ALTER TABLE "personal_events" ADD CONSTRAINT "personal_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
