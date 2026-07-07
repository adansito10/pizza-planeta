import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  items: {
    type: DataTypes.JSON, // Almacena el array de CartItem de forma serializada en formato JSON
    allowNull: false,
  },
  total: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('Pendiente', 'Preparando', 'Listo', 'Entregado'),
    allowNull: false,
    defaultValue: 'Pendiente',
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
  },
  paymentId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  preferenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  time: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now(),
  },
});

export default Order;
