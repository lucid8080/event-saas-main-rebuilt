-- Add upscaler support fields to generated_images table

ALTER TABLE "generated_images" 
ADD COLUMN "isUpscaled" BOOLEAN DEFAULT false,
ADD COLUMN "originalImageId" TEXT,
ADD COLUMN "upscaledImageId" TEXT,
ADD COLUMN "upscaleProvider" TEXT DEFAULT 'fal-ai/clarity-upscaler',
ADD COLUMN "upscaleSettings" JSONB;

-- Create indexes for new fields
CREATE INDEX "generated_images_isUpscaled_idx" ON "generated_images"("isUpscaled");
CREATE INDEX "generated_images_originalImageId_idx" ON "generated_images"("originalImageId");
CREATE INDEX "generated_images_upscaledImageId_idx" ON "generated_images"("upscaledImageId");

-- Add foreign key constraints for image relationships
ALTER TABLE "generated_images" 
ADD CONSTRAINT "generated_images_originalImageId_fkey" 
FOREIGN KEY ("originalImageId") REFERENCES "generated_images"("id") ON DELETE SET NULL;

ALTER TABLE "generated_images" 
ADD CONSTRAINT "generated_images_upscaledImageId_fkey" 
FOREIGN KEY ("upscaledImageId") REFERENCES "generated_images"("id") ON DELETE SET NULL;
