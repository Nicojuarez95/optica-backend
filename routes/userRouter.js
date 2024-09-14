import express from 'express';
import controller from '../controllers/userControllers.js'; // Asegúrate de que la ruta sea correcta

const { register, sign_in, get_all_users } = controller;

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);
// Ruta para iniciar sesión
router.post('/sign-in', sign_in);
// Ruta para obtener todos los usuarios
router.get('/users', get_all_users);

export default router;
