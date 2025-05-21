import express from 'express';
import citaController from '../controllers/citaControllers.js';
import authenticate from '../middlewares/authenticate.js'; // Middleware de protección

const router = express.Router();

// Todas las rutas aquí estarán protegidas y asociadas al óptico autenticado

// POST /api/citas -> Crear una nueva cita
router.post('/', authenticate, citaController.createCita);

// GET /api/citas -> Obtener todas las citas del óptico autenticado
router.get('/', authenticate, citaController.getMisCitas);

// GET /api/citas/:id -> Obtener una cita específica
router.get('/:id', authenticate, citaController.getCitaById);

// PUT /api/citas/:id -> Actualizar una cita específica
router.put('/:id', authenticate, citaController.updateCita);

// DELETE /api/citas/:id -> Eliminar una cita específica
router.delete('/:id', authenticate, citaController.deleteCita);

export default router;
