import Promo from '../models/Promo.js';
import Pizza from '../models/Pizza.js';

// @desc    Obtener todas las promociones
// @route   GET /api/promos
// @access  Public
export const getPromos = async (req, res) => {
  try {
    const promos = await Promo.findAll({
      include: [{ model: Pizza, as: 'pizzaBase' }]
    });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las promociones', error: error.message });
  }
};

// @desc    Crear una promoción
// @route   POST /api/promos
// @access  Public
export const createPromo = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, badge, pizzaBaseId } = req.body;

    const promoExiste = await Promo.findOne({ where: { nombre } });
    if (promoExiste) {
      return res.status(400).json({ message: 'Ya existe una promoción con este nombre' });
    }

    // Generar un ID basado en el nombre
    const id = nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);

    const promo = await Promo.create({
      id,
      nombre,
      descripcion,
      precio,
      imagen,
      badge,
      pizzaBaseId
    });

    // Cargar la promoción con su relación de Pizza
    const promoConRelacion = await Promo.findByPk(id, {
      include: [{ model: Pizza, as: 'pizzaBase' }]
    });

    res.status(201).json(promoConRelacion);
  } catch (error) {
    res.status(400).json({ message: 'Datos de promoción no válidos', error: error.message });
  }
};

// @desc    Actualizar una promoción
// @route   PUT /api/promos/:id
// @access  Public
export const updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id);

    if (promo) {
      promo.nombre = req.body.nombre || promo.nombre;
      promo.descripcion = req.body.descripcion || promo.descripcion;
      promo.precio = req.body.precio !== undefined ? req.body.precio : promo.precio;
      promo.imagen = req.body.imagen || promo.imagen;
      promo.badge = req.body.badge || promo.badge;
      promo.pizzaBaseId = req.body.pizzaBaseId || promo.pizzaBaseId;

      await promo.save();

      // Cargar los datos actualizados con su relación de Pizza
      const promoActualizada = await Promo.findByPk(req.params.id, {
        include: [{ model: Pizza, as: 'pizzaBase' }]
      });

      res.json(promoActualizada);
    } else {
      res.status(404).json({ message: 'Promoción no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la promoción', error: error.message });
  }
};

// @desc    Eliminar una promoción
// @route   DELETE /api/promos/:id
// @access  Public
export const deletePromo = async (req, res) => {
  try {
    const deletedCount = await Promo.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Promoción eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Promoción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la promoción', error: error.message });
  }
};
