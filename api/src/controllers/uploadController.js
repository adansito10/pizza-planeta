// @desc    Subir imagen a Cloudinary
// @route   POST /api/upload
// @access  Public
export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }

    // req.file.path contiene la URL segura provista por Cloudinary
    res.status(201).json({
      message: 'Imagen subida correctamente',
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar la subida del archivo', error: error.message });
  }
};
