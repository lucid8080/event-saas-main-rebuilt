-- Add provider-related fields to generated_images table

ALTER TABLE "generated_images" 
ADD COLUMN "aspectRatio" TEXT,
ADD COLUMN "styleName" TEXT,
ADD COLUMN "customStyle" TEXT,
ADD COLUMN "seed" TEXT,
ADD COLUMN "provider" TEXT DEFAULT 'ideogram',
ADD COLUMN "generationTimeMs" INTEGER,
ADD COLUMN "providerCost" DECIMAL(10,4) DEFAULT 0,
ADD COLUMN "quality" TEXT DEFAULT 'standard',
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "webpUrl" TEXT;

-- Create indexes for new fields
CREATE INDEX "generated_images_provider_idx" ON "generated_images"("provider");
CREATE INDEX "generated_images_aspectRatio_idx" ON "generated_images"("aspectRatio");
CREATE INDEX "generated_images_quality_idx" ON "generated_images"("quality");

-- Update existing records to have default values
UPDATE "generated_images" SET 
  "aspectRatio" = '1:1',
  "provider" = 'ideogram',
  "quality" = 'standard'
WHERE "aspectRatio" IS NULL;
