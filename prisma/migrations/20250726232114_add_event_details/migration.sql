-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION', 'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE');

-- AlterTable
ALTER TABLE "generated_images" ADD COLUMN     "eventDetails" JSONB,
ADD COLUMN     "eventType" "EventType";

-- CreateIndex
CREATE INDEX "generated_images_eventType_idx" ON "generated_images"("eventType");
