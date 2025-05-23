// routes/pacienteRoutes.js
import express from 'express';
import pacienteController from '../controllers/pacienteControllers.js';
import authenticate from '../middlewares/authenticate.js'; // Middleware de protección

const router = express.Router();

// Todas las rutas aquí estarán protegidas y asociadas al óptico autenticado
// El middleware 'authenticate' se encargará de verificar el token y añadir req.user

// POST /api/pacientes -> Crear un nuevo paciente
router.post('/', authenticate, pacienteController.createPaciente);

// GET /api/pacientes -> Obtener todos los pacientes del óptico autenticado
router.get('/', authenticate, pacienteController.getMisPacientes);

// GET /api/pacientes/:id -> Obtener un paciente específico
router.get('/:id', authenticate, pacienteController.getPacienteById);

// PUT /api/pacientes/:id -> Actualizar un paciente específico
router.put('/:id', authenticate, pacienteController.updatePaciente);

// DELETE /api/pacientes/:id -> Eliminar un paciente específico
router.delete('/:id', authenticate, pacienteController.deletePaciente);

// POST /api/pacientes/:pacienteId/prescripciones -> Añadir una prescripción al historial
router.post('/:pacienteId/prescripciones', authenticate, pacienteController.addPrescripcion);

// DELETE /api/pacientes/:pacienteId/prescripciones/:prescripcionId
router.delete('/:pacienteId/prescripciones/:prescripcionId', authenticate, pacienteController.deletePrescripcion);

export default router;
