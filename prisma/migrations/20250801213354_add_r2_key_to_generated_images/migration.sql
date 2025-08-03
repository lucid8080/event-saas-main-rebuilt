-- AlterTable
ALTER TABLE "generated_images" ADD COLUMN     "r2Key" TEXT;

-- CreateIndex
CREATE INDEX "generated_images_r2Key_idx" ON "generated_images"("r2Key");
