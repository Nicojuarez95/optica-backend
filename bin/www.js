#!/usr/bin/env node

// bin/www.js
import app from '../app.js'; // Importa la instancia de la app Express configurada
import http from 'http';
import dotenv from 'dotenv';

dotenv.config(); // Asegúrate que las variables de entorno estén disponibles

/**
 * Normaliza un puerto en un número, cadena o falso.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val; // named pipe
    }
    if (port >= 0) {
        return port; // port number
    }
    return false;
}

const port = normalizePort(process.env.PORT || '8000'); // Usa el puerto de tu .env o 8000 por defecto
app.set('port', port);

/**
 * Crea el servidor HTTP.
 */
const server = http.createServer(app);

/**
 * Escucha en el puerto proporcionado, en todas las interfaces de red.
 */
server.listen(port);

/**
 * Manejador de eventos para el evento "error" del servidor HTTP.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requiere privilegios elevados');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' ya está en uso');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
server.on('error', onError);

/**
 * Manejador de eventos para el evento "listening" del servidor HTTP.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log(`Servidor escuchando en ${bind}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Accede en: http://localhost:${addr.port}`);
}
server.on('listening', onListening);
