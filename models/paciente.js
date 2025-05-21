import mongoose from 'mongoose';

const historialPrescripcionSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    optometristaResponsable: { type: String, trim: true },
    diagnostico: { type: String, required: true, trim: true },
    graduacionOD: { type: String, default: "N/A", trim: true }, // Ojo Derecho
    graduacionOI: { type: String, default: "N/A", trim: true }, // Ojo Izquierdo
    adicion: { type: String, default: "N/A", trim: true },
    dp: { type: String, default: "N/A", trim: true }, // Distancia Pupilar
    observaciones: { type: String, trim: true }
}, { _id: true, timestamps: true }); // _id: true para poder referenciar/editar prescripciones individuales

const pacienteSchema = new mongoose.Schema({
    opticoId: { // Referencia al óptico (User) propietario
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Debe coincidir con el nombre del modelo de Óptico/User
        required: true,
    },
    nombreCompleto: { type: String, required: [true, 'El nombre completo del paciente es obligatorio.'], trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, match: [/.+\@.+\..+/, 'Email inválido (opcional)'] },
    fechaNacimiento: { type: Date },
    direccion: { type: String, trim: true },
    ocupacion: { type: String, trim: true },
    antecedentesMedicos: { type: String, trim: true },
    ultimaVisita: { type: Date },
    historialPrescripciones: [historialPrescripcionSchema],
    notasAdicionales: { type: String, trim: true },
}, { timestamps: true });

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;