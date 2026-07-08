import Order from '../models/Order.js';

// @desc    Obtener todas las órdenes
// @route   GET /api/orders
// @access  Public
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['timestamp', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
  }
};

// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
  }
};

// @desc    Crear una orden
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La orden debe contener al menos un producto' });
    }

    // Generación de número de orden consecutivo buscando el máximo existente
    const lastOrder = await Order.findOne({
      order: [['timestamp', 'DESC']],
    });

    let nextNum = 1;
    if (lastOrder) {
      const lastNumStr = lastOrder.orderNumber.replace('#', '');
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const orderNumber = '#' + String(nextNum).padStart(4, '0');

    // Hora formateada
    const now = new Date();
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const time = now.toLocaleTimeString('es-ES', options);

    const order = await Order.create({
      orderNumber,
      items,
      total,
      time,
      status: 'Pendiente',
      paymentStatus: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la orden', error: error.message });
  }
};

// @desc    Actualizar estado de una orden
// @route   PUT /api/orders/:id/status
// @access  Public
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pendiente', 'Preparando', 'Listo', 'Entregado'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado de orden no válido' });
    }

    const order = await Order.findByPk(req.params.id);

    if (order) {
      order.status = status;
      const orderActualizada = await order.save();
      res.json(orderActualizada);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el estado de la orden', error: error.message });
  }
};

// @desc    Eliminar/Cancelar una orden
// @route   DELETE /api/orders/:id
// @access  Public
export const deleteOrder = async (req, res) => {
  try {
    const deletedCount = await Order.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Orden eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la orden', error: error.message });
  }
};

// @desc    Limpiar todas las órdenes
// @route   POST /api/orders/clear
// @access  Public
export const clearAllOrders = async (req, res) => {
  try {
    await Order.destroy({ where: {} });
    res.json({ message: 'Todas las órdenes fueron eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al limpiar las órdenes', error: error.message });
  }
};
