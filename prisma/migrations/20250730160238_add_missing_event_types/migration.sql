-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'FAMILY_GATHERING';
ALTER TYPE "EventType" ADD VALUE 'BBQ';
ALTER TYPE "EventType" ADD VALUE 'PARK_GATHERING';
ALTER TYPE "EventType" ADD VALUE 'COMMUNITY_EVENT';
ALTER TYPE "EventType" ADD VALUE 'FUNDRAISER';
ALTER TYPE "EventType" ADD VALUE 'WORKSHOP';
ALTER TYPE "EventType" ADD VALUE 'MEETUP';
ALTER TYPE "EventType" ADD VALUE 'CELEBRATION';
ALTER TYPE "EventType" ADD VALUE 'REUNION';
ALTER TYPE "EventType" ADD VALUE 'POTLUCK';
ALTER TYPE "EventType" ADD VALUE 'GAME_NIGHT';
ALTER TYPE "EventType" ADD VALUE 'BOOK_CLUB';
ALTER TYPE "EventType" ADD VALUE 'ART_CLASS';
ALTER TYPE "EventType" ADD VALUE 'FITNESS_CLASS';
