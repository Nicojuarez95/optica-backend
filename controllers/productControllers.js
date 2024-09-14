import Product from '../models/productShema.js';

const controller = {
    create_product: async (req, res, next) => {
        try {
            const { name } = req.body;
            const product = new Product({ name });
            await product.save();
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                product
            });
        } catch (error) {
            next(error);
        }
    },

    get_products: async (req, res, next) => {
        try {
            const products = await Product.find();
            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully',
                products
            });
        } catch (error) {
            next(error);
        }
    }
};

export default controller;
