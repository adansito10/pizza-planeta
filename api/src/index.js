import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Configurar variables de entorno antes de cualquier otra cosa
dotenv.config();

// Conectar con la Base de Datos
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor de Planet Pizza corriendo en puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
});
