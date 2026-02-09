const mongoose = require('mongoose');

const priceOptionSchema = new mongoose.Schema({
    label: { type: String, required: true },   // e.g. "250g", "500g", "1 Kg"
    unit: { type: String, default: 'g' },      // g, kg, piece, etc.
    price: { type: Number, required: true },
    quantity: { type: Number },                // e.g. 250, 500, 1000
    isDefault: { type: Boolean, default: false }
}, { _id: false });

const menuSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    isAvailable: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    salesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    priceOptions: [priceOptionSchema],
    productInfo: {
        fullDescription: { type: String },
        ingredients: [String],
        nutritionalFacts: mongoose.Schema.Types.Mixed,
        healthBenefits: { type: String },
        storage: { type: String }
    }
});

module.exports = mongoose.model('Menu', menuSchema);
