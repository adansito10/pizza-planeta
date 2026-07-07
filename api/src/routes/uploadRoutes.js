import express from 'express';
import { parser } from '../config/cloudinary.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

// 'image' es el nombre del campo del formulario (form-data) que debe contener el archivo
router.post('/', parser.single('image'), uploadImage);

export default router;
