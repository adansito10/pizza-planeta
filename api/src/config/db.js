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
    // console.log('Tablas de PostgreSQL sincronizadas correctamente.');
  } catch (error) {
    console.error(`Error de conexión o sincronización a PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

export default sequelize;
