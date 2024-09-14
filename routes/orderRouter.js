import express from 'express';
import controller from '../controllers/orderControllers.js';

const { createOrder, getAllOrders, updateOrderStatus, delete_order } = controller;

const router = express.Router();

// Crear un nuevo pedido
router.post('/create', createOrder);
// Obtener todos los pedidos
router.get('/get', getAllOrders);
// Actualizar el estado del pedido
router.put('/ordersupdate/:id/status', updateOrderStatus);
// Eliminar un pedido
router.delete('/delete/:id', delete_order);

export default router;