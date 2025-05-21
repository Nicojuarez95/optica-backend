// routes/userRouter.js
import express from 'express';
import controller from '../controllers/userControllers.js';
import authenticate from '../middlewares/authenticate.js'; // Tu middleware de autenticación

const { register, sign_in, getMe } = controller; // Añadir getMe

const router = express.Router();

// Ruta para registrar un nuevo usuario (óptico)
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/sign-in', sign_in); // Mantengo tu nombre de ruta

// Ruta para obtener los datos del usuario (óptico) actualmente autenticado (NUEVO)
router.get('/me', authenticate, getMe);

export default router;

