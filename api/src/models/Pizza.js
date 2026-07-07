import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Pizza = sequelize.define('Pizza', {
  id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
  },
  precioBase: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  defaultMasa: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Tradicional',
  },
  defaultSalsa: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Salsa de Tomate',
  },
  defaultQueso: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Mozzarella',
  },
  defaultExtras: {
    type: DataTypes.JSON, // Guardamos la lista de ingredientes adicionales por defecto como JSON
    defaultValue: [],
  },
});

export default Pizza;
