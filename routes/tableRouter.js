import express from 'express';
import controller from '../controllers/tableControllers.js';

const { create_table, get_tables } = controller;

const router = express.Router();

router.post('/create', create_table);
router.get('/get', get_tables);

export default router;
