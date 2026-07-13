import express from 'express';
import {
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';

const router = express.Router();

router.route('/')
  .get(getPromos)
  .post(createPromo);

router.route('/:id')
  .put(updatePromo)
  .delete(deletePromo);

export default router;
