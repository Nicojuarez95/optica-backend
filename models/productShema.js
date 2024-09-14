import mongoose from 'mongoose';

// Definir el esquema de usuario
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

// Crear el modelo 'User'
const Product = mongoose.model('Product', productSchema);

export default Product;