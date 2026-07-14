import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL no está definida en las variables de entorno.');
  process.exit(1);
}

// Configuración de la instancia de Sequelize
export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false, // Cambiar a console.log si deseas ver las consultas SQL en la terminal
  define: {
    timestamps: true, // Habilita createdAt y updatedAt automáticamente para todos los modelos
  }
});

// Función para conectar y sincronizar base de datos
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Conectado exitosamente.');
    
    // Sincronización automática de modelos en desarrollo (deshabilitado a petición del usuario)
    // await sequelize.sync({ alter: true });
    
    // Migraciones manuales seguras
    // 1. Crear tabla de Users
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" UUID PRIMARY KEY,
        "nombre" VARCHAR(100) NOT NULL,
        "email" VARCHAR(100) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "rol" VARCHAR(20) NOT NULL DEFAULT 'cliente',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    
    // 2. Crear tabla de Promos
    await sequelize.query(`
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
    `);

    // Insertar promos por defecto si la tabla está vacía
    const [promosCount] = await sequelize.query(`SELECT COUNT(*) FROM "Promos";`);
    if (parseInt(promosCount[0].count) === 0) {
      await sequelize.query(`
        INSERT INTO "Promos" ("id", "nombre", "descripcion", "precio", "imagen", "badge", "pizzaBaseId", "createdAt", "updatedAt") VALUES
        ('combo-pareja', 'Combo Pareja', '1 Pizza Mediana de Pepperoni + 2 Refrescos. ¡Ideal para compartir!', 199.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', '', 'pizza-pepperoni', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('mega-familiar', 'Mega Familiar', '1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento. ¡Gran sabor familiar!', 329.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80', '', 'pizza-hawaiana', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `);
    }
    
    // 2. Columnas en Orders
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteNombre" VARCHAR(100) DEFAULT '';`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(50) DEFAULT 'pending';`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "paymentId" VARCHAR(100);`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "preferenceId" VARCHAR(100);`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "pickupCode" VARCHAR(10);`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "Users"("id") ON DELETE SET NULL;`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "time" VARCHAR(50);`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "timestamp" BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000;`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteTelefono" VARCHAR(20) DEFAULT '';`);
    await sequelize.query(`ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "clienteEmail" VARCHAR(100) DEFAULT '';`);
    
    // 3. Columnas en Users
    await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "apellido" VARCHAR(100) DEFAULT '';`);
    await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "telefono" VARCHAR(20) DEFAULT '';`);
    await sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "recibePromos" BOOLEAN DEFAULT FALSE;`);
    
    console.log('Tablas de PostgreSQL y columnas de Orders/Users actualizadas correctamente.');
  } catch (error) {
    console.error(`Error de conexión o sincronización a PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

export default sequelize;
