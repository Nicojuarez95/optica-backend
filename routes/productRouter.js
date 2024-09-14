import express from 'express';
import controller from '../controllers/productControllers.js';

const { create_product, get_products } = controller;

const router = express.Router();

router.post('/create', create_product);
router.get('/get', get_products);

export default router;
