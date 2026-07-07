import Pizza from '../models/Pizza.js';

// @desc    Obtener todas las pizzas
// @route   GET /api/pizzas
// @access  Public
export const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.findAll();
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las pizzas', error: error.message });
  }
};

// @desc    Obtener una pizza por ID
// @route   GET /api/pizzas/:id
// @access  Public
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (pizza) {
      res.json(pizza);
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la pizza', error: error.message });
  }
};

// @desc    Crear una pizza
// @route   POST /api/pizzas
// @access  Public
export const createPizza = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      imagen,
      precioBase,
      defaultMasa,
      defaultSalsa,
      defaultQueso,
      defaultExtras,
    } = req.body;

    const pizzaExiste = await Pizza.findOne({ where: { nombre } });
    if (pizzaExiste) {
      return res.status(400).json({ message: 'Ya existe una pizza con este nombre' });
    }

    // Generar un ID basado en el nombre (como en el frontend)
    const id = nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);

    const pizza = await Pizza.create({
      id,
      nombre,
      descripcion,
      imagen,
      precioBase,
      defaultMasa,
      defaultSalsa,
      defaultQueso,
      defaultExtras,
    });

    res.status(201).json(pizza);
  } catch (error) {
    res.status(400).json({ message: 'Datos de pizza no válidos', error: error.message });
  }
};

// @desc    Actualizar una pizza
// @route   PUT /api/pizzas/:id
// @access  Public
export const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);

    if (pizza) {
      pizza.nombre = req.body.nombre || pizza.nombre;
      pizza.descripcion = req.body.descripcion || pizza.descripcion;
      pizza.imagen = req.body.imagen || pizza.imagen;
      pizza.precioBase = req.body.precioBase !== undefined ? req.body.precioBase : pizza.precioBase;
      pizza.defaultMasa = req.body.defaultMasa || pizza.defaultMasa;
      pizza.defaultSalsa = req.body.defaultSalsa || pizza.defaultSalsa;
      pizza.defaultQueso = req.body.defaultQueso || pizza.defaultQueso;
      pizza.defaultExtras = req.body.defaultExtras || pizza.defaultExtras;

      const pizzaActualizada = await pizza.save();
      res.json(pizzaActualizada);
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la pizza', error: error.message });
  }
};

// @desc    Eliminar una pizza
// @route   DELETE /api/pizzas/:id
// @access  Public
export const deletePizza = async (req, res) => {
  try {
    const deletedCount = await Pizza.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Pizza eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la pizza', error: error.message });
  }
};
