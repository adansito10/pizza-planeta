import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import Order from '../models/Order.js';

// Inicializar Mercado Pago con el token de acceso de las variables de entorno
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'DUMMY_TOKEN',
});

// @desc    Crear preferencia de pago de Mercado Pago
// @route   POST /api/payments/create-preference
// @access  Public
export const createPaymentPreference = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'El ID de la orden es requerido' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Mapear los items de la orden al formato requerido por Mercado Pago
    // Nota: Como "items" en Sequelize es almacenado como JSON, podemos acceder directamente
    const items = order.items.map((item, index) => {
      const extrasText = item.extras && item.extras.length > 0
        ? ` (Extras: ${item.extras.map(e => e.nombre).join(', ')})`
        : '';
      
      const title = `Pizza ${item.pizza.nombre} - ${item.size.nombre}${extrasText}`;

      return {
        id: item.id || index.toString(),
        title: title,
        quantity: Number(item.cantidad),
        unit_price: Number(item.precioUnitario),
        currency_id: 'MXN', // Moneda por defecto
      };
    });

    const preference = new Preference(client);

    const webhookUrl = `${process.env.BACKEND_URL}/api/payments/webhook`;
    const isLocalhost = webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1');

    const bodyData = {
      items: items,
      backUrls: {
        success: `${process.env.FRONTEND_URL}/success?orderId=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/cart?status=failure`,
        pending: `${process.env.FRONTEND_URL}/cart?status=pending`,
      },
      autoReturn: 'approved',
      metadata: {
        order_id: orderId,
      },
    };

    if (!isLocalhost) {
      bodyData.notificationUrl = webhookUrl;
    }

    const response = await preference.create({
      body: bodyData,
    });

    // Guardar el preferenceId en la orden
    order.preferenceId = response.id;
    await order.save();

    res.status(200).json({
      preferenceId: response.id,
      initPoint: response.init_point,
    });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    res.status(500).json({
      message: 'Error al crear la preferencia de pago',
      error: error.message,
    });
  }
};

// @desc    Recibir notificaciones del Webhook de Mercado Pago
// @route   POST /api/payments/webhook
// @access  Public
export const handlePaymentWebhook = async (req, res) => {
  try {
    const { action, data, type } = req.body;
    
    const paymentId = req.query.id || (data && data.id);
    const notificationType = type || action;

    console.log(`Webhook recibido de Mercado Pago: Tipo=${notificationType}, ID=${paymentId}`);

    if (notificationType === 'payment' || notificationType === 'payment.created' || notificationType === 'payment.updated') {
      const paymentClient = new Payment(client);
      
      const paymentInfo = await paymentClient.get({ id: paymentId });
      
      const orderId = paymentInfo.metadata.order_id;
      const status = paymentInfo.status;

      console.log(`Estado del pago para la orden ${orderId}: ${status}`);

      if (orderId) {
        const order = await Order.findByPk(orderId);
        if (order) {
          order.paymentId = paymentId.toString();
          order.paymentStatus = status;

          if (status === 'approved') {
            order.status = 'Preparando';
          }

          await order.save();
          console.log(`Orden ${orderId} actualizada correctamente con pago estado: ${status}`);
        } else {
          console.error(`Orden ${orderId} no encontrada en la base de datos`);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error al procesar webhook de Mercado Pago:', error);
    res.status(200).send('Webhook recibido con errores internos');
  }
};
