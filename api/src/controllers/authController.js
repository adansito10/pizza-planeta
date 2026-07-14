import crypto from 'crypto';
import User from '../models/User.js';

// Helpers for secure password hashing (No external dependencies needed!)
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedPassword) => {
  if (!storedPassword || !storedPassword.includes(':')) return false;
  const [salt, originalHash] = storedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

// @desc    Register a new customer user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, recibePromos } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const user = await User.create({
      nombre,
      apellido: apellido || '',
      email: email.toLowerCase(),
      password: hashedPassword,
      telefono: telefono || '',
      recibePromos: recibePromos || false,
      rol: email.toLowerCase() === 'adandejesus200420@gmail.com' ? 'admin' : 'cliente'
    });

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        recibePromos: user.recibePromos,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
};

// @desc    Login a user (customer or admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Verify password
    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Force role admin for designated user if not already set
    if (user.email === 'adandejesus200420@gmail.com' && user.rol !== 'admin') {
      user.rol = 'admin';
      await user.save();
    }

    // Simple session token generation (Basic base64 for simplicity in demo)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido || '',
        email: user.email,
        telefono: user.telefono || '',
        recibePromos: user.recibePromos || false,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// @desc    Update a user profile
// @route   PUT /api/auth/update
// @access  Public
export const updateProfile = async (req, res) => {
  try {
    const { userId, nombre, apellido, email, password, telefono, recibePromos } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'El ID de usuario es requerido' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Check if new email is taken by someone else
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
      }
      user.email = email.toLowerCase();
    }

    if (nombre) user.nombre = nombre;
    if (apellido !== undefined) user.apellido = apellido;
    if (telefono !== undefined) user.telefono = telefono;
    if (recibePromos !== undefined) user.recibePromos = recibePromos;

    if (password) {
      user.password = hashPassword(password);
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Perfil actualizado con éxito',
      user: {
        id: updatedUser.id,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        telefono: updatedUser.telefono,
        recibePromos: updatedUser.recibePromos,
        rol: updatedUser.rol
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
  }
};

// @desc    Obtener lista de todos los usuarios registrados (sin contraseñas)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

