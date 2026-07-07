import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  precio: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  categoria: {
    type: DataTypes.ENUM('masa', 'salsa', 'queso', 'extra'),
    allowNull: false,
    validate: {
      isIn: [['masa', 'salsa', 'queso', 'extra']],
    },
  },
});

export default Ingredient;
