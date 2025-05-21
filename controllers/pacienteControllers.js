import Paciente from '../models/paciente.js';

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
            const pacientes = await Paciente.find({ opticoId }).sort({ nombreCompleto: 1 }); // Ordenar alfabéticamente
            
            res.status(200).json({ success: true, count: pacientes.length, pacientes });
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
            
            const paciente = await Paciente.findOneAndUpdate(
                { _id: pacienteId, opticoId }, // Condición de búsqueda
                req.body, // Datos a actualizar
                { new: true, runValidators: true } // Opciones: devolver el doc actualizado y correr validaciones
            );

            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no autorizado para modificar." });
            }

            res.status(200).json({ success: true, message: "Paciente actualizado.", paciente });
        } catch (error) {
             if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al actualizar", errors: error.errors });
            }
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
        try {
            const opticoId = req.user.id;
            const pacienteId = req.params.pacienteId; // ID del paciente al que se añade la prescripción
            const { fecha, optometristaResponsable, diagnostico, graduacionOD, graduacionOI, adicion, dp, observaciones } = req.body;

            const paciente = await Paciente.findOne({ _id: pacienteId, opticoId });
            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no autorizado." });
            }

            const nuevaPrescripcion = {
                fecha: fecha || new Date(),
                optometristaResponsable: optometristaResponsable || req.user.name, // Por defecto el óptico logueado
                diagnostico,
                graduacionOD,
                graduacionOI,
                adicion,
                dp,
                observaciones
            };
            
            paciente.historialPrescripciones.unshift(nuevaPrescripcion); // Añadir al inicio del array
            
            // Actualizar ultimaVisita si esta prescripción es la más reciente
            if (!paciente.ultimaVisita || new Date(nuevaPrescripcion.fecha) > new Date(paciente.ultimaVisita)) {
                paciente.ultimaVisita = nuevaPrescripcion.fecha;
            }

            await paciente.save();
            res.status(201).json({ success: true, message: "Prescripción añadida exitosamente.", paciente });

        } catch (error) {
            if (error.name === 'ValidationError') {
                 return res.status(400).json({ success: false, message: "Error de validación al añadir prescripción", errors: error.errors });
            }
            next(error);
        }
    },
    // Aquí podrías añadir métodos para editar o eliminar una prescripción específica si es necesario
};

export default pacienteController;
