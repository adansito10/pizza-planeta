import express from 'express';
import {
  getPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} from '../controllers/pizzaController.js';

const router = express.Router();

router.route('/')
  .get(getPizzas)
  .post(createPizza);

router.route('/:id')
  .get(getPizzaById)
  .put(updatePizza)
  .delete(deletePizza);

export default router;
