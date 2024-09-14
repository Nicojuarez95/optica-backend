import express from 'express'
import UserRouter from './userRouter.js'
import orderRouter from './orderRouter.js'
import tableRouter from './tableRouter.js'
import productRouter from './productRouter.js'

let router = express.Router();

router.use('/users', UserRouter);
router.use('/orders', orderRouter);
router.use('/tables', tableRouter);
router.use('/products', productRouter);

export default router
