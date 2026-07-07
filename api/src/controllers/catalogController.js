import Size from '../models/Size.js';
import Ingredient from '../models/Ingredient.js';

// ==========================================
// CONTROLADORES DE TAMAÑOS (SIZES)
// ==========================================

export const getSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los tamaños', error: error.message });
  }
};

export const createSize = async (req, res) => {
  try {
    const { nombre, medida, precio } = req.body;
    const sizeExiste = await Size.findOne({ where: { nombre } });
    if (sizeExiste) {
      return res.status(400).json({ message: 'Ya existe este tamaño' });
    }
    const size = await Size.create({ nombre, medida, precio });
    res.status(201).json(size);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el tamaño', error: error.message });
  }
};

export const updateSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (size) {
      size.nombre = req.body.nombre || size.nombre;
      size.medida = req.body.medida || size.medida;
      size.precio = req.body.precio !== undefined ? req.body.precio : size.precio;

      const sizeActualizado = await size.save();
      res.json(sizeActualizado);
    } else {
      res.status(404).json({ message: 'Tamaño no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el tamaño', error: error.message });
  }
};

export const deleteSize = async (req, res) => {
  try {
    const deletedCount = await Size.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Tamaño eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Tamaño no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el tamaño', error: error.message });
  }
};

// ==========================================
// CONTROLADORES DE INGREDIENTES (INGREDIENTS)
// ==========================================

export const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los ingredientes', error: error.message });
  }
};

export const createIngredient = async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;
    const ingredienteExiste = await Ingredient.findOne({ where: { nombre } });
    if (ingredienteExiste) {
      return res.status(400).json({ message: 'Ya existe este ingrediente' });
    }
    const ingredient = await Ingredient.create({ nombre, precio, categoria });
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el ingrediente', error: error.message });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (ingredient) {
      ingredient.nombre = req.body.nombre || ingredient.nombre;
      ingredient.precio = req.body.precio !== undefined ? req.body.precio : ingredient.precio;
      ingredient.categoria = req.body.categoria || ingredient.categoria;

      const ingredienteActualizado = await ingredient.save();
      res.json(ingredienteActualizado);
    } else {
      res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el ingrediente', error: error.message });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const deletedCount = await Ingredient.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Ingrediente eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el ingrediente', error: error.message });
  }
};
