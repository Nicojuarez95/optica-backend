import express from 'express';
import inventarioController from '../controllers/inventarioControllers.js';
import authenticate from '../middlewares/authenticate.js'; // Middleware de protección

const router = express.Router();

// Todas las rutas aquí estarán protegidas y asociadas al óptico autenticado

// POST /api/inventario -> Crear un nuevo item de inventario
router.post('/', authenticate, inventarioController.createItemInventario);

// GET /api/inventario -> Obtener todos los items de inventario del óptico autenticado
router.get('/', authenticate, inventarioController.getMiInventario);

// GET /api/inventario/:id -> Obtener un item de inventario específico
router.get('/:id', authenticate, inventarioController.getItemInventarioById);

// PUT /api/inventario/:id -> Actualizar un item de inventario específico
router.put('/:id', authenticate, inventarioController.updateItemInventario);

// DELETE /api/inventario/:id -> Eliminar un item de inventario específico
router.delete('/:id', authenticate, inventarioController.deleteItemInventario);

export default router;
