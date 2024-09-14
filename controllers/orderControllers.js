import Order from '../models/orderSchema.js';
import Table from '../models/tableSchema.js';
import Product from '../models/productShema.js';
import mongoose from 'mongoose';

const orderController = {
    // Crear un nuevo pedido
    createOrder: async (req, res, next) => {
        try {
            const { table, products, description, status, waiter } = req.body;
    
            // Verifica que waiter sea un ObjectId válido
            if (!mongoose.Types.ObjectId.isValid(waiter)) {
                return res.status(400).json({ message: 'Invalid waiter ID' });
            }
    
            // Verificar si la mesa existe y está disponible
            const tableExists = await Table.findById(table);
            if (!tableExists || tableExists.status !== 'available') {
                return res.status(400).json({ message: 'Table not available or does not exist' });
            }
    
            // Verificar si los productos existen
            const productIds = products.map(item => item.product);
            const existingProducts = await Product.find({ '_id': { $in: productIds } });
            const existingProductIds = existingProducts.map(product => product._id.toString());
    
            for (const item of products) {
                if (!existingProductIds.includes(item.product.toString())) {
                    return res.status(400).json({ message: `Product ${item.product} does not exist` });
                }
            }
    
            // Crear el pedido
            const order = new Order({ table, products, description, status, waiter });
    
            await order.save();
    
            // Marcar la mesa como ocupada
            tableExists.status = 'occupied';
            await tableExists.save();
    
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                order
            });
        } catch (error) {
            next(error);
        }
    },

    // Obtener todos los pedidos
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.find().populate('table').populate('products.product').populate('waiter');
            res.status(200).json({
                success: true,
                orders
            });
        } catch (error) {
            next(error);
        }
    },

    // Actualizar el estado de un pedido
    updateOrderStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validar el estado del pedido
            if (!['pending', 'preparing', 'ready', 'delivered'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            // Buscar y actualizar el pedido
            const order = await Order.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.status = status;
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                order
            });
        } catch (error) {
            next(error);
        }
    },
    delete_order: async (req, res, next) => {
        try {
            const { id } = req.params;

            // Eliminar el pedido
            const order = await Order.findByIdAndDelete(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Order deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
};

export default orderController;
