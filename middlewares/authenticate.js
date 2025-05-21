// middlewares/authenticate.js
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js'; // Tu modelo de Óptico/User
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET; // Usando tu variable de entorno

const authenticate = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            token = authHeader.split(' ')[1]; // Extraer el token "Bearer <token>"

            const decoded = jwt.verify(token, JWT_SECRET);

            // Adjuntar el usuario (óptico) a la solicitud, excluyendo la contraseña
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // Si el usuario no se encuentra (ej. fue eliminado después de emitir el token)
                return res.status(401).json({ success: false, message: 'No autorizado, usuario no encontrado.' });
            }

            next(); // Pasa al siguiente middleware o controlador
        } catch (error) {
            console.error('Error de autenticación en middleware:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, message: 'Token inválido.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'El token ha expirado.' });
            }
            return res.status(401).json({ success: false, message: 'No autorizado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'No autorizado, token no proporcionado.' });
    }
};

export default authenticate;