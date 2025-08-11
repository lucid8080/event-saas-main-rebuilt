-- Migration: Add provider settings and usage tracking tables
-- Creates tables for advanced AI provider management

-- Provider Settings table for storing advanced AI provider configurations
CREATE TABLE "ProviderSettings" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseSettings" JSONB NOT NULL DEFAULT '{}',
    "specificSettings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProviderSettings_pkey" PRIMARY KEY ("id")
);

-- Provider Usage Tracking table for cost and analytics
CREATE TABLE "ProviderUsage" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationId" TEXT,
    "cost" DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    "imageSize" TEXT,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "responseTime" INTEGER, -- milliseconds
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderUsage_pkey" PRIMARY KEY ("id")
);

-- Provider Budget Alerts table for cost management
CREATE TABLE "ProviderBudgetAlert" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budgetLimit" DECIMAL(10,2) NOT NULL,
    "currentSpend" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "alertThreshold" DECIMAL(3,2) NOT NULL DEFAULT 0.80, -- 80% threshold
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastAlertSent" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderBudgetAlert_pkey" PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX "ProviderSettings_providerId_idx" ON "ProviderSettings"("providerId");
CREATE INDEX "ProviderSettings_isActive_idx" ON "ProviderSettings"("isActive");
CREATE INDEX "ProviderSettings_isDefault_idx" ON "ProviderSettings"("isDefault");

CREATE INDEX "ProviderUsage_providerId_idx" ON "ProviderUsage"("providerId");
CREATE INDEX "ProviderUsage_userId_idx" ON "ProviderUsage"("userId");
CREATE INDEX "ProviderUsage_timestamp_idx" ON "ProviderUsage"("timestamp");
CREATE INDEX "ProviderUsage_success_idx" ON "ProviderUsage"("success");

CREATE INDEX "ProviderBudgetAlert_providerId_userId_idx" ON "ProviderBudgetAlert"("providerId", "userId");
CREATE INDEX "ProviderBudgetAlert_isActive_idx" ON "ProviderBudgetAlert"("isActive");

-- Foreign key constraints
ALTER TABLE "ProviderUsage" ADD CONSTRAINT "ProviderUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderBudgetAlert" ADD CONSTRAINT "ProviderBudgetAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique constraints
ALTER TABLE "ProviderSettings" ADD CONSTRAINT "ProviderSettings_providerId_name_key" UNIQUE ("providerId", "name");
ALTER TABLE "ProviderBudgetAlert" ADD CONSTRAINT "ProviderBudgetAlert_providerId_userId_key" UNIQUE ("providerId", "userId");

-- Default provider settings for existing providers
INSERT INTO "ProviderSettings" ("id", "providerId", "name", "description", "baseSettings", "specificSettings", "createdBy", "updatedBy") VALUES 
('ideogram-default', 'ideogram', 'Default Ideogram Settings', 'Default configuration for Ideogram provider', 
 '{"inferenceSteps": 30, "guidanceScale": 7.5, "enableSafetyChecker": true, "numImages": 1}',
 '{"ideogram": {"renderingSpeed": "TURBO", "magicPromptOption": "AUTO", "styleType": "GENERAL"}}',
 'system', 'system'),

('huggingface-default', 'huggingface', 'Default HuggingFace Settings', 'Default configuration for HuggingFace provider',
 '{"inferenceSteps": 25, "guidanceScale": 7.5, "enableSafetyChecker": true, "numImages": 1}',
 '{"huggingface": {"model": "stabilityai/stable-diffusion-xl-base-1.0", "schedulerType": "DPMSolverMultistepScheduler"}}',
 'system', 'system'),

('qwen-default', 'qwen', 'Default Qwen Settings', 'Default configuration for Qwen provider',
 '{"inferenceSteps": 25, "guidanceScale": 4.0, "enableSafetyChecker": true, "numImages": 1}',
 '{"qwen": {"promptEnhance": true, "aspectRatio": "1:1"}}',
 'system', 'system'),

('fal-qwen-default', 'fal-qwen', 'Default Fal-AI Qwen Settings', 'Default configuration for Fal-AI Qwen provider',
 '{"inferenceSteps": 25, "guidanceScale": 3.0, "enableSafetyChecker": true, "numImages": 1, "costPerImage": 0.05}',
 '{"fal-qwen": {"imageSize": "square_hd", "syncMode": false, "numInferenceSteps": 25, "guidanceScale": 3.0}}',
 'system', 'system');
