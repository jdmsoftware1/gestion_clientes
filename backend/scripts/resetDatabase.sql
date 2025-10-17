-- Reset Database Script for Neon PostgreSQL
-- Este script borra todas las tablas existentes y crea una estructura limpia y funcional

-- ============================================================
-- DROP ALL TABLES (CASCADE para eliminar las restricciones)
-- ============================================================
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "sales" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "salespeople" CASCADE;

-- ============================================================
-- CREATE SALESPEOPLE TABLE
-- ============================================================
CREATE TABLE "salespeople" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE,
  "internal_code" VARCHAR(255) UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CREATE CLIENTS TABLE
-- ============================================================
CREATE TABLE "clients" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "internal_code" VARCHAR(255) UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(255),
  "email" VARCHAR(255),
  "address" VARCHAR(255),
  "salesperson_id" UUID REFERENCES "salespeople"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CREATE SALES TABLE
-- ============================================================
CREATE TABLE "sales" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "amount" DECIMAL(12, 2) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CREATE PAYMENTS TABLE
-- ============================================================
CREATE TABLE "payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "amount" DECIMAL(12, 2) NOT NULL,
  "payment_method" VARCHAR(255) NOT NULL,
  "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CREATE INDEXES
-- ============================================================
CREATE INDEX "idx_clients_salesperson_id" ON "clients"("salesperson_id");
CREATE INDEX "idx_sales_client_id" ON "sales"("client_id");
CREATE INDEX "idx_payments_client_id" ON "payments"("client_id");

-- ============================================================
-- INSERT DEFAULT SALESPERSON FOR IMPORTS
-- ============================================================
INSERT INTO "salespeople" ("name", "created_at", "updated_at") 
VALUES ('Importado', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- DATABASE RESET COMPLETE
-- ============================================================