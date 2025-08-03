/*
  Warnings:

  - The values [FAMILY_GATHERING] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'HOLIDAY_CELEBRATION', 'CONCERT', 'SPORTS_EVENT', 'NIGHTLIFE', 'CAROUSEL_BACKGROUND', 'OTHER');
ALTER TABLE "generated_images" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TABLE "image_generation_stats" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;
