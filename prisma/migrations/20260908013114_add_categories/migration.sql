-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_code_key" ON "Category"("code");

-- Expand
ALTER TABLE "Incident" ADD COLUMN "categoryId" UUID;

-- Migrate existing data
INSERT INTO "Category" ("id", "code", "name", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'GENERAL',
    'General',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE SET
    "name" = EXCLUDED."name",
    "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Incident"
SET "categoryId" = '00000000-0000-4000-8000-000000000001'
WHERE "categoryId" IS NULL;

-- Contract
ALTER TABLE "Incident" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
