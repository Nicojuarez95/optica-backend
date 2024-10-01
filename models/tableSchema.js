import mongoose from 'mongoose';

// Definir el esquema de usuario
const tableSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    status: { type: String, enum: ['available', 'occupied'], default: 'available' }
});

const Table = mongoose.model('Table', tableSchema);

export default Table;