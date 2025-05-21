import express from 'express';
import UserRouter from './userRouter.js'; // Tus rutas de autenticación
import pacienteRoutes from './pacienteRouter.js';
import citaRoutes from './citaRouter.js'; // <--- NUEVO
import inventarioRoutes from './inventarioRouter.js'; // <--- NUEVO

const router = express.Router();

// Rutas de autenticación (prefijo /users como lo tienes)
router.use('/users', UserRouter);

// Rutas para la gestión de pacientes (prefijo /pacientes)
router.use('/pacientes', pacienteRoutes);

// Rutas para la gestión de citas (prefijo /citas)
router.use('/citas', citaRoutes); // <--- NUEVO

// Rutas para la gestión de inventario (prefijo /inventario)
router.use('/inventario', inventarioRoutes); // <--- NUEVO

// Ruta raíz de la API para verificar que funciona
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API de OptiSys MultiUsuario funcionando correctamente!'
    });
});

export default router;
