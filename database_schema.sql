-- ============================================================================
-- SCRIPT DE CREACIÓN Y ACTUALIZACIÓN DE BASE DE DATOS - PLANET PIZZA (POSTGRESQL)
-- Este archivo contiene la estructura completa DDL de la base de datos PostgreSQL,
-- incluyendo las tablas, tipos ENUM, relaciones y llaves foráneas definidas.
-- ============================================================================

-- 1. TIPOS ENUM PERSONALIZADOS
-- Nota: En PostgreSQL, los tipos ENUM se definen a nivel de base de datos.
-- Si ya existen, se puede saltar su creación.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Ingredients_categoria') THEN
        CREATE TYPE "enum_Ingredients_categoria" AS ENUM ('masa', 'salsa', 'queso', 'extra');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Orders_status') THEN
        CREATE TYPE "enum_Orders_status" AS ENUM ('Pendiente', 'Preparando', 'Listo', 'Entregado');
    END IF;
END
$$;

-- 2. TABLA: Users (Usuarios Administradores y Clientes Registrados)
CREATE TABLE IF NOT EXISTS "Users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'cliente',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: Ingredients (Ingredientes del Catálogo)
CREATE TABLE IF NOT EXISTS "Ingredients" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL UNIQUE,
    "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
    "categoria" "enum_Ingredients_categoria" NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: Sizes (Tamaños de Pizza)
CREATE TABLE IF NOT EXISTS "Sizes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL UNIQUE,
    "medida" VARCHAR(100) NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: Pizzas (Catálogo de Pizzas)
CREATE TABLE IF NOT EXISTS "Pizzas" (
    "id" VARCHAR(100) PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL UNIQUE,
    "descripcion" TEXT,
    "imagen" VARCHAR(255) DEFAULT '',
    "precioBase" DOUBLE PRECISION NOT NULL CHECK ("precioBase" >= 0),
    "defaultMasa" VARCHAR(100) DEFAULT 'Tradicional',
    "defaultSalsa" VARCHAR(100) DEFAULT 'Salsa de Tomate',
    "defaultQueso" VARCHAR(100) DEFAULT 'Mozzarella',
    "defaultExtras" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: Promos (Combos y Promociones)
CREATE TABLE IF NOT EXISTS "Promos" (
    "id" VARCHAR(100) PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL UNIQUE,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
    "imagen" VARCHAR(255) DEFAULT '',
    "badge" VARCHAR(100) DEFAULT '',
    "pizzaBaseId" VARCHAR(100) NOT NULL REFERENCES "Pizzas"("id") ON UPDATE CASCADE ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: Orders (Pedidos)
CREATE TABLE IF NOT EXISTS "Orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderNumber" VARCHAR(20) NOT NULL UNIQUE,
    "clienteNombre" VARCHAR(100) DEFAULT '',
    "items" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL CHECK ("total" >= 0),
    "status" "enum_Orders_status" NOT NULL DEFAULT 'Pendiente',
    "paymentStatus" VARCHAR(50) DEFAULT 'pending',
    "paymentId" VARCHAR(100),
    "preferenceId" VARCHAR(100),
    "pickupCode" VARCHAR(10),
    "userId" UUID REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    "time" VARCHAR(50),
    "timestamp" BIGINT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MIGRACIONES Y ACTUALIZACIONES DE COLUMNAS (Para bases de datos existentes)
-- Ejecutar estas sentencias si ya tiene las tablas base creadas para asegurar
-- compatibilidad con los nuevos módulos de Mercado Pago e Inicios de Sesión.
-- ============================================================================

-- Asegurar la existencia de las columnas en "Orders":
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteNombre" VARCHAR(100) DEFAULT '';
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(50) DEFAULT 'pending';
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentId" VARCHAR(100);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "preferenceId" VARCHAR(100);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "pickupCode" VARCHAR(10);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "time" VARCHAR(50);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "timestamp" BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000;

-- 8. Insertar Promociones por defecto (Combos)
INSERT INTO "Promos" ("id", "nombre", "descripcion", "precio", "imagen", "badge", "pizzaBaseId") VALUES
('combo-pareja', 'Combo Pareja', '1 Pizza Mediana de Pepperoni + 2 Refrescos. ¡Ideal para compartir!', 199.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', '', 'pizza-pepperoni'),
('mega-familiar', 'Mega Familiar', '1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento. ¡Gran sabor familiar!', 329.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80', '', 'pizza-hawaiana')
ON CONFLICT ("nombre") DO NOTHING;

