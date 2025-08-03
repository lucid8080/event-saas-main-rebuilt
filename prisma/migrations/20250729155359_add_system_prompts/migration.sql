-- CreateTable
CREATE TABLE "system_prompts" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_prompts_category_idx" ON "system_prompts"("category");

-- CreateIndex
CREATE INDEX "system_prompts_subcategory_idx" ON "system_prompts"("subcategory");

-- CreateIndex
CREATE INDEX "system_prompts_isActive_idx" ON "system_prompts"("isActive");

-- CreateIndex
CREATE INDEX "system_prompts_createdAt_idx" ON "system_prompts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_prompts_category_subcategory_version_key" ON "system_prompts"("category", "subcategory", "version");
