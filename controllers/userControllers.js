import bcrypt from 'bcryptjs';
import User from '../models/userSchema.js'; // Tu modelo de Óptico/User
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h'; // Puedes añadir esto a tu .env

const controller = {
    // Registro de un nuevo óptico
    register: async (req, res, next) => {
        try {
            const { name, email, password } = req.body;

            // Validaciones básicas
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' });
            }
            // Validación de formato de email (básica, el modelo también valida)
            if (!/.+\@.+\..+/.test(email)) {
                 return res.status(400).json({ success: false, message: 'Formato de email inválido.' });
            }

            const existingUser = await User.findOne({ email }); // Verificar por email (que es único)
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Ya existe un usuario con este email.' });
            }

            // El hashing de la contraseña se maneja con el middleware pre-save en userSchema.js
            const newUser = await User.create({
                name,
                email,
                password,
            });

            // Generar token para el nuevo usuario
            const token = jwt.sign({ id: newUser._id /*, role: newUser.role (si lo implementas) */ }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            return res.status(201).json({
                success: true,
                message: 'Usuario (Óptico) creado exitosamente.',
                token,
                user: { // Devolver solo información no sensible
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                }
            });
        } catch (error) {
            // console.error("Error en registro:", error);
            next(error); // Pasa el error al manejador de errores global
        }
    },

    // Inicio de sesión de un óptico
    sign_in: async (req, res, next) => {
        try {
            const { email, password } = req.body; // Cambiado de 'name' a 'email' para el login

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios.' });
            }

            const user = await User.findOne({ email }); // Buscar por email
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas.' // Mensaje genérico
                });
            }

            const isMatch = await user.comparePassword(password); // Usar el método del schema
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas.' // Mensaje genérico
                });
            }

            const token = jwt.sign({ id: user._id /*, role: user.role */ }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            return res.status(200).json({
                success: true,
                message: 'Usuario autenticado exitosamente.',
                token,
                user: { // Devolver solo información no sensible
                    id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        } catch (error) {
            // console.error("Error en sign_in:", error);
            next(error);
        }
    },

    // Obtener datos del óptico actualmente autenticado (NUEVO)
    getMe: async (req, res, next) => {
        try {
            // req.user es establecido por el middleware 'authenticate'
            const currentUser = req.user;
            
            if (!currentUser) { // Aunque el middleware ya debería haberlo manejado
                return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
            }

            res.status(200).json({
                success: true,
                user: {
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default controller;
