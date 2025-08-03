-- CreateTable
CREATE TABLE "generated_carousels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slides" JSONB NOT NULL,
    "slideUrls" TEXT[],
    "aspectRatio" TEXT NOT NULL DEFAULT '1:1',
    "slideCount" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_carousels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generated_carousels_userId_idx" ON "generated_carousels"("userId");

-- AddForeignKey
ALTER TABLE "generated_carousels" ADD CONSTRAINT "generated_carousels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
