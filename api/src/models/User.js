import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '',
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '',
  },
  recibePromos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'cliente',
  },
});

export default User;
