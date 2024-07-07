const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserDetails } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para el login de usuarios
router.post('/login', loginUser);

// Ruta para obtener los detalles del usuario autenticado
// 'protect' es un middleware que asegura que el usuario esté autenticado
router.get('/profile', protect, getUserDetails);

module.exports = router;
