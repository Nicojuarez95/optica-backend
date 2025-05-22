import ItemInventario from '../models/itemInventario.js'; // Ajusta la ruta si es necesario

const inventarioController = {
    // Crear un nuevo item en el inventario para el óptico autenticado
    createItemInventario: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            // Extraer todos los campos relevantes del body
            const { 
                nombreProducto, tipoProducto, marca, modelo, descripcion, 
                color, material, proveedor, costoAdquisicion, 
                precioVenta, stockActual, stockMinimoAlerta, ubicacionAlmacen, notasItem 
            } = req.body;

            if (!nombreProducto || !tipoProducto || precioVenta === undefined || stockActual === undefined) {
                return res.status(400).json({ success: false, message: "Nombre, tipo, precio de venta y stock son obligatorios." });
            }

            const nuevoItem = await ItemInventario.create({
                opticoId,
                nombreProducto, 
                tipoProducto, 
                marca, 
                modelo, 
                descripcion,
                color, 
                material, 
                proveedor, 
                costoAdquisicion,
                precioVenta, 
                stockActual, 
                stockMinimoAlerta,
                notasItem
            });

            res.status(201).json({ success: true, message: "Item de inventario creado exitosamente.", item: nuevoItem });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al crear item", errors: error.errors });
            }
            next(error);
        }
    },

    // Obtener todos los items del inventario del óptico autenticado
    getMiInventario: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            // Opciones de filtrado (ej. por tipo, marca, stock bajo) podrían añadirse aquí desde req.query
            // Ejemplo: /api/inventario?tipoProducto=Armazón&stockMenorA=5
            const queryFilters = { opticoId };
            if (req.query.tipoProducto) {
                queryFilters.tipoProducto = req.query.tipoProducto;
            }
            if (req.query.marca) {
                queryFilters.marca = { $regex: req.query.marca, $options: 'i' }; // Búsqueda insensible a mayúsculas
            }
            if (req.query.stockMenorA) {
                queryFilters.stockActual = { $lt: parseInt(req.query.stockMenorA) };
            }
            if (req.query.nombreProducto) {
                queryFilters.nombreProducto = { $regex: req.query.nombreProducto, $options: 'i' };
                }

            const items = await ItemInventario.find(queryFilters).sort({ nombreProducto: 1 });

            res.status(200).json({ success: true, count: items.length, items });
        } catch (error) {
            next(error);
        }
    },

    // Obtener un item específico del inventario por su ID
    getItemInventarioById: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const itemId = req.params.id;

            const item = await ItemInventario.findOne({ _id: itemId, opticoId });

            if (!item) {
                return res.status(404).json({ success: false, message: "Item de inventario no encontrado o no pertenece a este óptico." });
            }
            res.status(200).json({ success: true, item });
        } catch (error) {
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ success: false, message: "ID de item inválido." });
            }
            next(error);
        }
    },

    // Actualizar un item del inventario
    updateItemInventario: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const itemId = req.params.id;
            // No permitir actualizar opticoId directamente desde el body
            const { opticoId: _, ...datosActualizar } = req.body;


            const item = await ItemInventario.findOneAndUpdate(
                { _id: itemId, opticoId },
                datosActualizar, // El modelo se encargará de los campos que se pueden actualizar
                { new: true, runValidators: true }
            );

            if (!item) {
                return res.status(404).json({ success: false, message: "Item de inventario no encontrado o no autorizado para modificar." });
            }

            res.status(200).json({ success: true, message: "Item de inventario actualizado.", item });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: "Error de validación al actualizar item", errors: error.errors });
            }
            next(error);
        }
    },

    // Eliminar un item del inventario
    deleteItemInventario: async (req, res, next) => {
        try {
            const opticoId = req.user.id;
            const itemId = req.params.id;

            const item = await ItemInventario.findOneAndDelete({ _id: itemId, opticoId });

            if (!item) {
                return res.status(404).json({ success: false, message: "Item de inventario no encontrado o no autorizado para eliminar." });
            }
            res.status(200).json({ success: true, message: "Item de inventario eliminado exitosamente." });
        } catch (error) {
            next(error);
        }
    }
};

export default inventarioController;
