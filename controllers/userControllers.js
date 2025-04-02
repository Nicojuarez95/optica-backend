import bcrypt from 'bcryptjs';
import User from '../models/userSchema.js';
import jwt from 'jsonwebtoken';

const controller = {
    // Registro de usuario
    register: async (req, res, next) => {
        try {
            const { name, password } = req.body;

            // Verificar si el usuario ya existe (en este caso, solo verificamos por nombre)
            const existingUser = await User.findOne({ name });
            if (existingUser) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear nuevo usuario
            const newUser = await User.create({
                name,
                password: hashedPassword,
            });

            return res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                user: newUser
            });
        } catch (error) {
            next(error);
        }
    },

    // Inicio de sesión
    sign_in: async (req, res, next) => {
        try {
            const { name, password } = req.body;

            // Buscar el usuario por su nombre
            const user = await User.findOne({ name });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            // Comparar las contraseñas
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            // Generar el token
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });


            return res.status(200).json({
                success: true,
                message: 'Usuario autenticado exitosamente',
                token,
                user
            });
        } catch (error) {
            next(error);
        }
    },

};

export default controller;

