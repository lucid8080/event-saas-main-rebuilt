-- AlterTable
ALTER TABLE "generated_images" ADD COLUMN     "compressionRatio" DECIMAL(5,2),
ADD COLUMN     "originalFormat" TEXT,
ADD COLUMN     "webpEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "webpKey" TEXT;

-- CreateIndex
CREATE INDEX "generated_images_webpKey_idx" ON "generated_images"("webpKey");

-- CreateIndex
CREATE INDEX "generated_images_webpEnabled_idx" ON "generated_images"("webpEnabled");
