-- CreateTable
CREATE TABLE "image_access_logs" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "accessCount" INTEGER NOT NULL DEFAULT 1,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "r2_performance_logs" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "duration" INTEGER NOT NULL,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "r2_performance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_access_logs_imageId_idx" ON "image_access_logs"("imageId");

-- CreateIndex
CREATE INDEX "image_access_logs_userId_idx" ON "image_access_logs"("userId");

-- CreateIndex
CREATE INDEX "image_access_logs_lastAccessed_idx" ON "image_access_logs"("lastAccessed");

-- CreateIndex
CREATE UNIQUE INDEX "image_access_logs_imageId_userId_accessType_key" ON "image_access_logs"("imageId", "userId", "accessType");

-- CreateIndex
CREATE INDEX "r2_performance_logs_operation_idx" ON "r2_performance_logs"("operation");

-- CreateIndex
CREATE INDEX "r2_performance_logs_success_idx" ON "r2_performance_logs"("success");

-- CreateIndex
CREATE INDEX "r2_performance_logs_timestamp_idx" ON "r2_performance_logs"("timestamp");
