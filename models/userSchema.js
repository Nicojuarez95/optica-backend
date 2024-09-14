import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'waiter', 'chef'], // Roles específicos para tu aplicación
    default: 'waiter' // Por defecto será mesero
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;