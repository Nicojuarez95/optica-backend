// models/userSchema.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { // Nombre completo del óptico
        type: String,
        required: [true, 'El nombre es obligatorio.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio.'],
        unique: true, // El email debe ser único
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor, introduce un email válido.'],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria.'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres.'],
    },
    // Aquí podrías añadir un campo 'role' si necesitas diferentes tipos de usuarios en el futuro
    // role: { type: String, enum: ['optico', 'admin'], default: 'optico' }
}, { timestamps: true });

// Middleware para hashear la contraseña ANTES de guardar el usuario
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        // Si la contraseña no ha cambiado, no hacer nada y pasar al siguiente middleware
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error); // Pasar el error al manejador de errores
    }
});

// Método para comparar la contraseña ingresada con la almacenada (hasheada)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema); // 'User' se referirá a un Óptico

export default User;