-- CreateTable
CREATE TABLE "r2_alerts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "r2_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "r2_alerts_type_idx" ON "r2_alerts"("type");

-- CreateIndex
CREATE INDEX "r2_alerts_severity_idx" ON "r2_alerts"("severity");

-- CreateIndex
CREATE INDEX "r2_alerts_acknowledged_idx" ON "r2_alerts"("acknowledged");

-- CreateIndex
CREATE INDEX "r2_alerts_timestamp_idx" ON "r2_alerts"("timestamp");
