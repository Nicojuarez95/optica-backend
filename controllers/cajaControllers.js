// import Paciente from '../models/Paciente.js'; // Ajusta la ruta si es diferente
// import mongoose from 'mongoose';

// const cajaController = {
//     getReporteCajaDiarioPrescripciones: async (req, res, next) => {
//         console.log("BACKEND: getReporteCajaDiarioPrescripciones - INICIO");
//         try {
//             if (!req.user || !req.user.id) {
//                 console.error("BACKEND: Usuario no autenticado o ID no encontrado en req.user");
//                 return res.status(401).json({ success: false, message: "Usuario no autenticado." });
//             }
//             const opticoId = req.user.id;
//             const { fecha } = req.query;

//             if (!fecha) {
//                 return res.status(400).json({ success: false, message: "Debe proporcionar una fecha para el reporte." });
//             }
//             if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
//                 return res.status(400).json({ success: false, message: "Formato de fecha inválido. Use YYYY-MM-DD." });
//             }

//             const inicioDelDia = new Date(fecha + "T00:00:00.000Z");
//             const finDelDia = new Date(fecha + "T23:59:59.999Z");

//             console.log(`BACKEND: Buscando prescripciones para opticoId: ${opticoId} entre ${inicioDelDia.toISOString()} y ${finDelDia.toISOString()}`);

//             const pacientesDelOptico = await Paciente.find({ opticoId });

//             let transaccionesDelDia = [];
//             let totalNetoVendido = 0;
//             let totalMontoEntregado = 0;
//             let totalSaldoPendiente = 0;

//             pacientesDelOptico.forEach(paciente => {
//                 paciente.historialPrescripciones.forEach(prescripcion => {
//                     const fechaPrescripcion = new Date(prescripcion.fecha);
//                     if (fechaPrescripcion >= inicioDelDia && fechaPrescripcion <= finDelDia) {
//                         // Considerar solo prescripciones con datos financieros y que no estén canceladas (ajusta según tu lógica)
//                         if (prescripcion.subtotal !== undefined && prescripcion.totalNeto !== undefined && prescripcion.estadoVenta !== 'Cancelada') {
//                             transaccionesDelDia.push({
//                                 _id: prescripcion._id,
//                                 pacienteId: paciente._id,
//                                 pacienteNombre: paciente.nombreCompleto,
//                                 numeroComprobante: prescripcion.numeroComprobante || 'S/N',
//                                 descripcionConceptos: prescripcion.descripcionConceptos,
//                                 subtotal: prescripcion.subtotal,
//                                 descuentoPorcentaje: prescripcion.descuentoPorcentaje,
//                                 montoDescuento: prescripcion.montoDescuento,
//                                 totalNeto: prescripcion.totalNeto,
//                                 montoEntregado: prescripcion.montoEntregado,
//                                 saldoPendiente: prescripcion.saldoPendiente,
//                                 metodoPagoEntregado: prescripcion.metodoPagoEntregado,
//                                 fechaPrescripcion: prescripcion.fecha,
//                                 estadoVenta: prescripcion.estadoVenta
//                             });
//                             totalNetoVendido += prescripcion.totalNeto || 0;
//                             totalMontoEntregado += prescripcion.montoEntregado || 0;
//                             totalSaldoPendiente += prescripcion.saldoPendiente || 0;
//                         }
//                     }
//                 });
//             });
            
//             transaccionesDelDia.sort((a,b) => new Date(b.fechaPrescripcion) - new Date(a.fechaPrescripcion));

//             res.status(200).json({
//                 success: true,
//                 fechaReporte: fecha,
//                 transacciones: transaccionesDelDia,
//                 resumen: {
//                     totalVendidoNeto: parseFloat(totalNetoVendido.toFixed(2)),
//                     totalMontoEntregado: parseFloat(totalMontoEntregado.toFixed(2)),
//                     totalSaldoPendiente: parseFloat(totalSaldoPendiente.toFixed(2)),
//                     conteoTransacciones: transaccionesDelDia.length
//                 }
//             });
//             console.log("BACKEND: Reporte de caja diario enviado.");

//         } catch (error) {
//             console.error("BACKEND: Error en getReporteCajaDiarioPrescripciones:", error);
//             res.status(500).json({ success: false, message: "Error interno del servidor al generar el reporte de caja." });
//         }
//     },
//     // Aquí podrías añadir más funciones para la caja en el futuro (ej. apertura, cierre, arqueo)
// };

// export default cajaController;