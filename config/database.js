// config/database.js
import mongoose from 'mongoose';
// No necesitas dotenv aquí si ya lo cargas en app.js o www.js antes de llamar a connectDB
// import dotenv from 'dotenv';
// dotenv.config();

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false); // Puedes mantener esta configuración
        await mongoose.connect(process.env.DB_MONGO || process.env.MONGO); // Usa la variable de tu .env
        console.log('database connected'); // O 'MongoDB Conectada Exitosamente'
    } catch (err) {
        console.error('Error al conectar con MongoDB:', err.message);
        process.exit(1); // Detener la app si la conexión falla
    }
};

export default connectDB; // <--- Esta es la línea clave que faltaba