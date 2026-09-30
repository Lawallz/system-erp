-- CreateTable
CREATE TABLE "purchase_costings" (
    "id" TEXT NOT NULL,
    "purchase_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_costings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_costings_purchase_id_created_at_idx" ON "purchase_costings"("purchase_id", "created_at");

-- CreateIndex
CREATE INDEX "purchase_costings_created_by_id_idx" ON "purchase_costings"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_costings_purchase_id_stage_revision_key" ON "purchase_costings"("purchase_id", "stage", "revision");

-- AddForeignKey
ALTER TABLE "purchase_costings" ADD CONSTRAINT "purchase_costings_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_costings" ADD CONSTRAINT "purchase_costings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

