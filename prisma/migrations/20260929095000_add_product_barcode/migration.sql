-- Nullable: existing products and their history are preserved.
ALTER TABLE "products" ADD COLUMN "barcode" TEXT;
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
