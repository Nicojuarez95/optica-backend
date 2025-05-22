import mongoose from 'mongoose';

const itemInventarioSchema = new mongoose.Schema({
    opticoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nombreProducto: { type: String, required: [true, 'El nombre del producto es obligatorio.'], trim: true },
    tipoProducto: {
        type: String,
        required: true,
        enum: ['Armazón', 'Lente de Contacto', 'Lente Oftálmico', 'Solución Limpiadora', 'Accesorio', 'Gafas de Sol', 'Otro'],
        trim: true
    },
    marca: { type: String, trim: true },
    modelo: { type: String, trim: true },
    descripcion: { type: String, trim: true },
    color: { type: String, trim: true },
    material: { type: String, trim: true },
    proveedor: { type: String, trim: true },
    costoAdquisicion: { type: Number, min: 0 },
    precioVenta: { type: Number, required: [true, 'El precio de venta es obligatorio.'], min: 0 },
    stockActual: { type: Number, required: true, min: 0, default: 0 },
    stockMinimoAlerta: { type: Number, min: 0, default: 1 },
    ultimaActualizacionStock: { type: Date, default: Date.now },
    notasItem: { type: String, trim: true }
}, { timestamps: true });

itemInventarioSchema.pre('save', function(next) {
    if (this.isModified('stockActual') || this.isNew) {
        this.ultimaActualizacionStock = Date.now();
    }
    next();
});

const ItemInventario = mongoose.model('ItemInventario', itemInventarioSchema);

export default ItemInventario;