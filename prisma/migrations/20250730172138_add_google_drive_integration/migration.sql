-- AlterTable
ALTER TABLE "generated_images" ADD COLUMN     "googleDriveFileId" TEXT,
ADD COLUMN     "googleDriveThumbnail" TEXT,
ADD COLUMN     "googleDriveWebLink" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'ideogram';

-- CreateIndex
CREATE INDEX "generated_images_storageProvider_idx" ON "generated_images"("storageProvider");
