import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'; // Para logging de peticiones HTTP
import connectDB from './config/database.js';
import mainRouter from './routes/index.js'; // Tu enrutador principal desde routes/index.js

// Cargar variables de entorno desde .env
dotenv.config();

// Conectar a la base de datos MongoDB
connectDB();

// Crear la aplicación Express
const app = express();

// --- Middlewares Esenciales ---
// Habilitar CORS para permitir peticiones de otros dominios
// Configura 'origin' según tus necesidades en producción
app.use(cors({
  // origin: 'http://localhost:3000', // Ejemplo para desarrollo con frontend en puerto 3000
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsear cuerpos de petición JSON
app.use(express.json());
// Parsear cuerpos de petición URL-encoded (formularios HTML)
app.use(express.urlencoded({ extended: true }));

// Logging de peticiones HTTP (útil en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('short')); // Un formato más conciso para producción
}

// --- Rutas Principales de la API ---
// Todas las rutas definidas en routes/index.js se montarán bajo el prefijo /api
app.use('/api', mainRouter);


// --- Manejo de Errores ---
// Middleware para manejar rutas no encontradas (404)
// Debe ir después de todas tus rutas
app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    error.status = 404;
    next(error); // Pasa el error al siguiente manejador de errores
});

// Middleware manejador de errores global
// (Este captura errores pasados por next(error) desde cualquier parte de la app)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const statusCode = err.status || 500; // Si el error no tiene status, es un error de servidor
    
    console.error("-------------------- ERROR DETECTADO --------------------");
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.error("Status:", statusCode);
    console.error("Mensaje:", err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error("Stack:", err.stack);
    }
    console.error("-------------------------------------------------------");

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Ha ocurrido un error en el servidor.',
        // En desarrollo, podrías querer enviar el stack del error, pero nunca en producción
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

export default app;