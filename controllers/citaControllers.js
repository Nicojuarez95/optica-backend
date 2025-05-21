import Cita from '../models/cita.js';
import Paciente from '../models/paciente.js';

const citaController = {
    // Crear una nueva cita para el óptico autenticado
    createCita: async (req, res, next) => {
        try {
            const opticoId = req.user.id; // Asignado por el middleware 'authenticate'
            const { pacienteId, fechaHora, duracionEstimadaMinutos, tipoCita, optometristaAsignado, notasCita, estado } = req.body;

            if (!pacienteId || !fechaHora) {
                return res.status(400).json({ success: false, message: "El ID del paciente y la fecha/hora son obligatorios." });
            }

            // Verificar que el paciente pertenece al óptico
            const paciente = await Paciente.findOne({ _id: pacienteId, opticoId });
            if (!paciente) {
                return res.status(404).json({ success: false, message: "Paciente no encontrado o no pertenece a este óptico." });
            }

            const nuevaCita = await Cita.create({
                opticoId,
                pacienteId,
                pacienteNombre: paciente.nombreCompleto, // Guardar el nombre para referencia rápida
                fechaHora,
                duracionEstimadaMinutos,
                tipoCita,
                optometristaAsignado: optometristaAsignado || req.user.name, // Por defecto el óptico logueado
                notasCita,
                estado: estado || 'Programada' // Estado inicial por defecto si no se provee
            });

            res.status(201).json({ success: true, message: "Cita creada exitosamente.", cita: nuevaCita });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al crear cita.", errors: error.errors });
            }
            next(error); // Pasa al manejador de errores global
        }
    },

    // Obtener todas las citas del óptico autenticado
    getMisCitas: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            // Opciones de filtrado (ej. por fecha, estado, paciente) podrían añadirse aquí desde req.query
            // Ejemplo: /api/citas?estado=Programada&fechaDesde=2024-01-01&fechaHasta=2024-01-31
            const queryFilters = { opticoId };
            if (req.query.estado) {
                queryFilters.estado = req.query.estado;
            }
            if (req.query.pacienteId) {
                queryFilters.pacienteId = req.query.pacienteId;
            }
            if (req.query.fechaDesde) {
                queryFilters.fechaHora = { ...queryFilters.fechaHora, $gte: new Date(req.query.fechaDesde) };
            }
            if (req.query.fechaHasta) {
                // Para incluir todo el día de fechaHasta, se puede ajustar la hora a 23:59:59.999
                const hasta = new Date(req.query.fechaHasta);
                hasta.setHours(23, 59, 59, 999);
                queryFilters.fechaHora = { ...queryFilters.fechaHora, $lte: hasta };
            }


            const citas = await Cita.find(queryFilters)
                .populate('pacienteId', 'nombreCompleto telefono email') // Opcional: traer datos del paciente
                .sort({ fechaHora: 1 }); // Ordenar por fecha y hora ascendente

            res.status(200).json({ success: true, count: citas.length, citas });
        } catch (error) {
            next(error);
        }
    },

    // Obtener una cita específica por su ID
    getCitaById: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const citaId = req.params.id; // Asumiendo que el ID de la cita viene en la URL

            const cita = await Cita.findOne({ _id: citaId, opticoId })
                .populate('pacienteId', 'nombreCompleto telefono email');

            if (!cita) {
                return res.status(404).json({ success: false, message: "Cita no encontrada o no pertenece a este óptico." });
            }
            res.status(200).json({ success: true, cita });
        } catch (error) {
            if (error.kind === 'ObjectId') { // Si el formato del ID es incorrecto
                return res.status(400).json({ success: false, message: "ID de cita inválido." });
            }
            next(error);
        }
    },

    // Actualizar una cita
    updateCita: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const citaId = req.params.id;
            // Excluir opticoId del body para evitar que se modifique
            const { opticoId: _, pacienteId, ...camposActualizar } = req.body;


            // Si se intenta cambiar el pacienteId, verificar que el nuevo paciente pertenezca al óptico
            if (pacienteId) {
                const pacienteNuevo = await Paciente.findOne({ _id: pacienteId, opticoId });
                if (!pacienteNuevo) {
                    return res.status(400).json({ success: false, message: "El paciente especificado para la cita no es válido o no pertenece a este óptico." });
                }
                camposActualizar.pacienteId = pacienteId; // Incluir el pacienteId validado
                camposActualizar.pacienteNombre = pacienteNuevo.nombreCompleto; // Actualizar el nombre del paciente
            }
            
            const cita = await Cita.findOneAndUpdate(
                { _id: citaId, opticoId }, // Condición de búsqueda
                camposActualizar, // Datos a actualizar
                { new: true, runValidators: true } // Opciones: devolver el doc actualizado y correr validaciones
            ).populate('pacienteId', 'nombreCompleto telefono email');

            if (!cita) {
                return res.status(404).json({ success: false, message: "Cita no encontrada o no autorizada para modificar." });
            }

            res.status(200).json({ success: true, message: "Cita actualizada.", cita });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al actualizar cita.", errors: error.errors });
            }
            next(error);
        }
    },

    // Eliminar una cita
    deleteCita: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const citaId = req.params.id;

            const cita = await Cita.findOneAndDelete({ _id: citaId, opticoId });

            if (!cita) {
                return res.status(404).json({ success: false, message: "Cita no encontrada o no autorizada para eliminar." });
            }
            res.status(200).json({ success: true, message: "Cita eliminada exitosamente." });
        } catch (error) {
            next(error);
        }
    }
};

export default citaController;
