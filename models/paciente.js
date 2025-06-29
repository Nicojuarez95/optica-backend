import mongoose from 'mongoose';

const historialPrescripcionSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    optometristaResponsable: { type: String, trim: true },
    diagnostico: { type: String, required: true, trim: true },

    // --- CAMPOS DE GRADUACIÓN DETALLADOS ---
    // Ojo Derecho
    graduacionOD_Esfera: { type: String, trim: true, default: "" },
    graduacionOD_Cilindro: { type: String, trim: true, default: "" },
    graduacionOD_Eje: { type: String, trim: true, default: "" },
    // Ojo Izquierdo
    graduacionOI_Esfera: { type: String, trim: true, default: "" },
    graduacionOI_Cilindro: { type: String, trim: true, default: "" },
    graduacionOI_Eje: { type: String, trim: true, default: "" },
    
    adicion: { type: String, trim: true, default: "" }, // Puede ser "N/A" o un valor como "+1.50"
    dp: { type: String, trim: true, default: "" },      // Distancia Pupilar. Ej: "62" o "31/31"

    // --- CAMPOS FINANCIEROS ---
    descripcionConceptos: { type: String, trim: true, default: "" },
    subtotal: { type: Number, default: 0 },
    descuentoPorcentaje: { type: Number, default: 0, min: 0, max: 100 },
    montoDescuento: { type: Number, default: 0 },      // Campo real para almacenar el cálculo
    totalNeto: { type: Number, default: 0 },           // Campo real para almacenar el cálculo
    montoEntregado: { type: Number, default: 0 },
    saldoPendiente: { type: Number, default: 0 },      // Campo real para almacenar el cálculo
    metodoPagoEntregado: { type: String, trim: true, default: "Efectivo" },
    numeroComprobante: { type: String, sparse: true, trim: true },

    observaciones: { type: String, trim: true, default: "" } // Solo una definición
}, { _id: true, timestamps: true });

historialPrescripcionSchema.virtual('montoDescuentoCalculado').get(function() {
    return (this.subtotal && this.descuentoPorcentaje) ? (this.subtotal * this.descuentoPorcentaje) / 100 : 0;
});

const pacienteSchema = new mongoose.Schema({
    opticoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nombreCompleto: { type: String, required: [true, 'El nombre completo del paciente es obligatorio.'], trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, match: [/.+\@.+\..+/, 'Email inválido (opcional)'] },
    fechaNacimiento: { type: Date },
    direccion: { type: String, trim: true },
    ocupacion: { type: String, trim: true },
    antecedentesMedicos: { type: String, trim: true },
    ultimaVisita: { 
        type: String, 
        trim: true,
        // match: [/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha para Última Visita debe ser YYYY-MM-DD'] // Opcional
    },
    historialPrescripciones: [historialPrescripcionSchema], // <--- Usa el schema actualizado
    notasAdicionales: { type: String, trim: true },
}, { timestamps: true });

const Paciente = mongoose.model('Paciente', pacienteSchema);

export default Paciente;