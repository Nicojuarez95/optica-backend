import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
    opticoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true,
    },
    pacienteNombre: { type: String, required: true, trim: true }, // Para referencia rápida
    fechaHora: { type: Date, required: [true, 'La fecha y hora de la cita son obligatorias.'] },
    duracionEstimadaMinutos: { type: Number, default: 30, min: 5 },
    tipoCita: { type: String, enum: ['Examen Visual', 'Adaptación Lentes de Contacto', 'Revisión', 'Urgencia', 'Otro'], default: 'Examen Visual', trim: true },
    optometristaAsignado: { type: String, trim: true },
    estado: {
        type: String,
        enum: ['Programada', 'Confirmada', 'Cancelada por Paciente', 'Cancelada por Óptica', 'Completada', 'No Asistió'],
        default: 'Programada'
    },
    notasCita: { type: String, trim: true },
}, { timestamps: true });

const Cita = mongoose.model('Cita', citaSchema);

export default Cita;
