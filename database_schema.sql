-- ============================================================================
-- SCRIPT DE CREACIÓN Y ACTUALIZACIÓN DE BASE DE DATOS - PLANET PIZZA (POSTGRESQL)
-- Este archivo contiene la estructura completa DDL de la base de datos PostgreSQL,
-- incluyendo las tablas, tipos ENUM, relaciones y llaves foráneas definidas.
-- ============================================================================

-- 1. EXTENSIONES Y TIPOS ENUM PERSONALIZADOS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    "apellido" VARCHAR(100) DEFAULT '',
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) NOT NULL DEFAULT 'cliente',
    "telefono" VARCHAR(20) DEFAULT '',
    "recibePromos" BOOLEAN NOT NULL DEFAULT FALSE,
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
    "clienteTelefono" VARCHAR(20) DEFAULT '',
    "clienteEmail" VARCHAR(100) DEFAULT '',
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
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteTelefono" VARCHAR(20) DEFAULT '';
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteEmail" VARCHAR(100) DEFAULT '';
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(50) DEFAULT 'pending';
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentId" VARCHAR(100);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "preferenceId" VARCHAR(100);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "pickupCode" VARCHAR(10);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "Users"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "time" VARCHAR(50);
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "timestamp" BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000;

-- Asegurar la existencia de las columnas en "Users":
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "apellido" VARCHAR(100) DEFAULT '';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "telefono" VARCHAR(20) DEFAULT '';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "recibePromos" BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- INSERCIONES DE DATOS POR DEFECTO
-- ============================================================================

-- Insertar Tamaños de Pizza
INSERT INTO "Sizes" (nombre, medida, precio) VALUES 
('Personal', '25 cm', 90.00),
('Mediana', '30 cm', 150.00),
('Familiar', '35 cm', 200.00)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Ingredientes
INSERT INTO "Ingredients" (nombre, precio, categoria) VALUES 
('Masa Tradicional', 0.00, 'masa'),
('Masa Delgada', 10.00, 'masa'),
('Masa Orilla de Queso', 35.00, 'masa'),
('Salsa de Tomate', 0.00, 'salsa'),
('Salsa BBQ', 10.00, 'salsa'),
('Mozzarella', 15.00, 'queso'),
('Doble Queso', 25.00, 'queso'),
('Pepperoni', 20.00, 'extra'),
('Piña', 15.00, 'extra'),
('Jamón', 20.00, 'extra'),
('Champiñones', 18.00, 'extra'),
('Cebolla', 10.00, 'extra')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Pizzas
INSERT INTO "Pizzas" (id, nombre, descripcion, imagen, "precioBase", "defaultMasa", "defaultSalsa", "defaultQueso", "defaultExtras") VALUES 
('pizza-pepperoni', 'Pizza de Pepperoni', 'La clásica e infalible, repleta de pepperoni crujiente y queso fundido.', '/images/pepperoni.jpg', 120.00, 'Masa Tradicional', 'Salsa de Tomate', 'Mozzarella', '["Pepperoni"]'::jsonb),
('pizza-hawaiana', 'Pizza Hawaiana', 'Para los amantes del contraste: jamón jugoso y piña dulce.', '/images/hawaiana.jpg', 130.00, 'Masa Tradicional', 'Salsa de Tomate', 'Mozzarella', '["Piña", "Jamón"]'::jsonb),
('pizza-vegetariana', 'Pizza Vegetariana', 'Fresca y ligera, cargada de champiñones frescos y cebolla.', '/images/vegetariana.jpg', 110.00, 'Masa Delgada', 'Salsa de Tomate', 'Mozzarella', '["Champiñones", "Cebolla"]'::jsonb),
('pizza-bbq', 'Pizza BBQ', 'Todo el sabor del BBQ con una base ahumada y doble queso.', '/images/bbq.jpg', 140.00, 'Masa Tradicional', 'Salsa BBQ', 'Doble Queso', '[]'::jsonb)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Promociones por defecto (Combos)
INSERT INTO "Promos" ("id", "nombre", "descripcion", "precio", "imagen", "badge", "pizzaBaseId") VALUES
('combo-pareja', 'Combo Pareja', '1 Pizza Mediana de Pepperoni + 2 Refrescos. ¡Ideal para compartir!', 199.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', 'Popular', 'pizza-pepperoni'),
('mega-familiar', 'Mega Familiar', '1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento. ¡Gran sabor familiar!', 329.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80', 'Más Vendido', 'pizza-hawaiana')
ON CONFLICT ("nombre") DO NOTHING;

-- Insertar Usuario Administrador por defecto
-- Correo: adandejesus200420@gmail.com
-- Contraseña descifrada: admin123
INSERT INTO "Users" (id, nombre, apellido, email, password, rol, telefono, "recibePromos")
VALUES (
  'd3b07384-d113-4956-a3f2-1fb3a2f3fcfd',
  'Adán de Jesús',
  'Morales',
  'adandejesus200420@gmail.com',
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4:5b156685fedc638f627306d6bd66b3cebf1626ffcb2e976fbf0e337768d3bc3f21a27a744db3f25352c3575c8b20ef88b9a102694bb8db2547411f386ef73ef4',
  'admin',
  '2712917011',
  true
)
ON CONFLICT (email) DO NOTHING;
