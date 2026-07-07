import express from 'express';
import {
  createPaymentPreference,
  handlePaymentWebhook,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-preference', createPaymentPreference);
router.post('/webhook', handlePaymentWebhook);

export default router;
