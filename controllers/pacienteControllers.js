import Paciente from '../models/paciente.js';
import mongoose from 'mongoose';

const pacienteController = {
    // Crear un nuevo paciente para el óptico autenticado
    createPaciente: async (req, res, next) => {
        try {
            const opticoId = req.user.id; // ID del óptico desde el middleware authenticate
            const { nombreCompleto, telefono, email, fechaNacimiento, direccion, ocupacion, antecedentesMedicos, notasAdicionales } = req.body;

            if (!nombreCompleto) {
                return res.status(400).json({ success: false, message: "El nombre completo del paciente es requerido." });
            }

            const nuevoPaciente = await Paciente.create({
                opticoId, // Asociar con el óptico logueado
                nombreCompleto,
                telefono,
                email,
                fechaNacimiento,
                direccion,
                ocupacion,
                antecedentesMedicos,
                notasAdicionales,
                historialPrescripciones: [] // Iniciar historial vacío por defecto
            });

            res.status(201).json({ success: true, message: "Paciente creado exitosamente.", paciente: nuevoPaciente });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación", errors: error.errors });
            }
            next(error);
        }
    },

    // Obtener todos los pacientes del óptico autenticado
    getMisPacientes: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const queryFilters = { opticoId };
        
            const pacientes = await Paciente.find(queryFilters); // Esto dices que funciona
    
            // La línea que da el error:
            const count = await Paciente.countDocuments(queryFilters); 
           
            res.status(200).json({
                success: true,
                count: count,
                pacientes: pacientes 
            });
        } catch (error) {
            next(error);
        }
    },

    // Obtener un paciente específico por su ID (asegurándose que pertenece al óptico)
    getPacienteById: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const pacienteId = req.params.id; // Asumiendo que el ID del paciente viene en la URL

            const paciente = await Paciente.findOne({ _id: pacienteId, opticoId });

            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no pertenece a este óptico." });
            }
            res.status(200).json({ success: true, paciente });
        } catch (error) {
            if (error.kind === 'ObjectId') { // Si el formato del ID es incorrecto
                return res.status(400).json({ success: false, message: "ID de paciente inválido." });
            }
            next(error);
        }
    },

    // Actualizar un paciente (asegurándose que pertenece al óptico)
    updatePaciente: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const pacienteId = req.params.id;
    
            // Log para ver qué llega para ultimaVisita
            if (req.body.ultimaVisita) {}
            
            const paciente = await Paciente.findOneAndUpdate(
                { _id: pacienteId, opticoId },
                req.body,
                { new: true, runValidators: true }
            );
    
            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no autorizado para modificar." });
            }
    
            res.status(200).json({ success: true, message: "Paciente actualizado.", paciente });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al actualizar", errors: error.errors });
            }
            console.error("Error en updatePaciente:", error); // Loguear otros errores
            next(error);
        }
    },

    // Eliminar un paciente (asegurándose que pertenece al óptico)
    deletePaciente: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const pacienteId = req.params.id;

            const paciente = await Paciente.findOneAndDelete({ _id: pacienteId, opticoId });

            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no autorizado para eliminar." });
            }
            // Considerar eliminar citas asociadas si es necesario
            res.status(200).json({ success: true, message: "Paciente eliminado exitosamente." });
        } catch (error) {
            next(error);
        }
    },
    
    // --- Historial de Prescripciones ---
    addPrescripcion: async (req, res, next) => {
        console.log("🧾 Datos recibidos en req.body:", req.body);
        console.log("👤 Usuario autenticado:", req.user);
        console.log("🆔 ID del paciente:", req.params.pacienteId);

    try {
        const opticoId = req.user.id;
        const pacienteId = req.params.pacienteId;

        const {
            fecha, optometristaResponsable, diagnostico,
            graduacionOD_Esfera, graduacionOD_Cilindro, graduacionOD_Eje,
            graduacionOI_Esfera, graduacionOI_Cilindro, graduacionOI_Eje,
            adicion, dp,
            descripcionConceptos, subtotal, descuentoPorcentaje, montoEntregado, metodoPagoEntregado, numeroComprobante,
            observaciones
        } = req.body;

        const paciente = await Paciente.findOne({ _id: pacienteId, opticoId });
        if (!paciente) {
            return res.status(404).json({ success: false, message: "Paciente no encontrado o no autorizado." });
        }

        // Validación de campo obligatorio
        if (!numeroComprobante || !numeroComprobante.toString().trim()) {
            return res.status(400).json({
                success: false,
                errors: {
                    numeroComprobante: {
                        message: "El número de comprobante es obligatorio."
                    }
                }
            });
        }

        const comprobanteIngresado = numeroComprobante.toString().trim().toLowerCase();

        // Validar si ya existe en este paciente
        const yaExiste = paciente.historialPrescripciones.some(p =>
            p.numeroComprobante &&
            p.numeroComprobante.toString().trim().toLowerCase() === comprobanteIngresado
        );

        if (yaExiste) {
            return res.status(400).json({
                success: false,
                errors: {
                    numeroComprobante: {
                        message: "Este número de comprobante ya fue utilizado para este paciente."
                    }
                }
            });
        }

        // Cálculos financieros
        const subtotalNum = parseFloat(subtotal) || 0;
        const descuentoPorcNum = parseFloat(descuentoPorcentaje) || 0;
        const montoEntregadoNum = parseFloat(montoEntregado) || 0;

        const montoDescuentoCalc = (subtotalNum * descuentoPorcNum) / 100;
        const totalNetoCalc = subtotalNum - montoDescuentoCalc;
        const saldoPendienteCalc = totalNetoCalc - montoEntregadoNum;

        const nuevaPrescripcionData = {
            fecha: fecha ? new Date(fecha) : new Date(),
            optometristaResponsable: optometristaResponsable || (req.user?.nombre || req.user?.name || 'N/A'),
            diagnostico,
            graduacionOD_Esfera: graduacionOD_Esfera || "",
            graduacionOD_Cilindro: graduacionOD_Cilindro || "",
            graduacionOD_Eje: graduacionOD_Eje || "",
            graduacionOI_Esfera: graduacionOI_Esfera || "",
            graduacionOI_Cilindro: graduacionOI_Cilindro || "",
            graduacionOI_Eje: graduacionOI_Eje || "",
            adicion: adicion || "",
            dp: dp || "",
            descripcionConceptos,
            subtotal: subtotalNum,
            descuentoPorcentaje: descuentoPorcNum,
            montoDescuento: montoDescuentoCalc,
            totalNeto: totalNetoCalc,
            montoEntregado: montoEntregadoNum,
            saldoPendiente: saldoPendienteCalc,
            metodoPagoEntregado,
            numeroComprobante: comprobanteIngresado,
            observaciones
        };

        paciente.historialPrescripciones.unshift(nuevaPrescripcionData);

        if (!paciente.ultimaVisita || new Date(nuevaPrescripcionData.fecha) > new Date(paciente.ultimaVisita)) {
            paciente.ultimaVisita = nuevaPrescripcionData.fecha;
        }

        await paciente.save();

        const prescripcionAgregada = paciente.historialPrescripciones[0];

        res.status(201).json({
            success: true,
            message: "Prescripción añadida exitosamente.",
            paciente,
            prescripcion: prescripcionAgregada
        });

    } catch (error) {
        console.error("BACKEND: Error detallado en addPrescripcion:", error);
        if (error.name === 'ValidationError') {
            const errors = {};
            for (const field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ success: false, message: "Error de validación al añadir prescripción", errors });
        }
        res.status(500).json({ success: false, message: "Error interno del servidor al añadir la prescripción." });
    }
},

deletePrescripcion : async (req, res, next) => {
    try {
        const opticoId = req.user.id; // ID del óptico logueado
        const { pacienteId, prescripcionId } = req.params;

        // Validar que los IDs sean ObjectIds válidos de MongoDB
        if (!mongoose.Types.ObjectId.isValid(pacienteId) || !mongoose.Types.ObjectId.isValid(prescripcionId)) {
            return res.status(400).json({ success: false, message: "ID de paciente o prescripción inválido." });
        }

        const paciente = await Paciente.findOne({ _id: pacienteId, opticoId });

        if (!paciente) {
            return res.status(404).json({ success: false, message: "Paciente no encontrado o no pertenece a este óptico." });
        }

        // Encontrar la prescripción y eliminarla del array
        // El método pull de Mongoose es ideal para esto
        const resultadoUpdate = await Paciente.updateOne(
            { _id: pacienteId, opticoId },
            { $pull: { historialPrescripciones: { _id: prescripcionId } } }
        );

        if (resultadoUpdate.modifiedCount === 0) {
            // Si no se modificó nada, puede ser que la prescripción no existiera con ese ID en ese paciente
            return res.status(404).json({ success: false, message: "Prescripción no encontrada en este paciente." });
        }

        // Opcional: Volver a obtener el paciente actualizado para devolverlo si es necesario,
        // o simplemente confirmar la eliminación.
        // const pacienteActualizado = await Paciente.findById(pacienteId);

        res.status(200).json({ 
            success: true, 
            message: "Prescripción eliminada exitosamente.",
            pacienteId: pacienteId, // Para identificar al paciente en el frontend
            prescripcionId: prescripcionId // Para identificar la prescripción eliminada en el frontend
        });

    } catch (error) {
        console.error("Error en deletePrescripcion:", error);
        next(error);
    }
},


    // Aquí podrías añadir métodos para editar o eliminar una prescripción específica si es necesario
};

export default pacienteController;
