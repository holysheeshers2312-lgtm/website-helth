const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // Starters, Mains, etc.
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: true } // Added for filtering if needed
});

module.exports = mongoose.model('Menu', menuSchema);
