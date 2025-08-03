-- AlterTable
ALTER TABLE "generated_carousels" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "generated_images" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "generated_carousels_isPublic_idx" ON "generated_carousels"("isPublic");

-- CreateIndex
CREATE INDEX "generated_images_isPublic_idx" ON "generated_images"("isPublic");
