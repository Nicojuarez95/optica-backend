import express from 'express';
import controller from '../controllers/userControllers.js'; // Asegúrate de que la ruta sea correcta

const { register, sign_in } = controller;

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);
// Ruta para iniciar sesión
router.post('/sign-in', sign_in);


export default router;
