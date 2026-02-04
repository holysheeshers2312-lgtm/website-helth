require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

const CATEGORIES = [
    { name: 'Starters', displayOrder: 0 },
    { name: 'Mains', displayOrder: 1 },
    { name: 'Breads', displayOrder: 2 },
    { name: 'Desserts', displayOrder: 3 },
    { name: 'Beverages', displayOrder: 4 }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/spice_route");
        console.log('✅ Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('🗑️  Cleared Category collection');

        // Insert categories
        await Category.insertMany(CATEGORIES);
        console.log('🌱 Seeded Categories');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
