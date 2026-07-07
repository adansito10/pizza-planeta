import express from 'express';
import {
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../controllers/catalogController.js';

const router = express.Router();

// Rutas para Tamaños (Sizes)
router.route('/sizes')
  .get(getSizes)
  .post(createSize);

router.route('/sizes/:id')
  .put(updateSize)
  .delete(deleteSize);

// Rutas para Ingredientes
router.route('/ingredients')
  .get(getIngredients)
  .post(createIngredient);

router.route('/ingredients/:id')
  .put(updateIngredient)
  .delete(deleteIngredient);

export default router;
