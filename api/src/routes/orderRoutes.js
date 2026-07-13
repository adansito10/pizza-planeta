import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  clearAllOrders,
  confirmOrderPayment,
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/clear')
  .post(clearAllOrders);

router.route('/:id')
  .get(getOrderById)
  .delete(deleteOrder);

router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/:id/confirm-payment')
  .put(confirmOrderPayment);

export default router;
