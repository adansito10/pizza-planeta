import express from 'express';
import { register, login, updateProfile, getAllUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update', updateProfile);
router.get('/users', getAllUsers);

export default router;
