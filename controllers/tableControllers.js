import Table from '../models/tableSchema.js';

const controller = {
    create_table: async (req, res, next) => {
        try {
            const { number, status } = req.body;
            const table = new Table({ number, status });
            await table.save();
            res.status(201).json({
                success: true,
                message: 'Table created successfully',
                table
            });
        } catch (error) {
            next(error);
        }
    },

    get_tables: async (req, res, next) => {
        try {
            const tables = await Table.find();
            res.status(200).json({
                success: true,
                message: 'Tables retrieved successfully',
                tables
            });
        } catch (error) {
            next(error);
        }
    }
};

export default controller;