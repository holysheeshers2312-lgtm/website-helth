const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/spice_route";

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const testOrder = new Order({
            customer: {
                name: "Test User",
                phone: "9998887777",
                address: "123 Test St, Debug City"
            },
            items: [
                { name: "Butter Chicken", price: 350, quantity: 1, id: "item_1" },
                { name: "Naan", price: 40, quantity: 2, id: "item_2" }
            ],
            totalAmount: 430,
            paymentId: "pay_test_" + Date.now(),
            orderId: "order_" + Date.now(),
            status: "received",
            createdAt: new Date()
        });

        await testOrder.save();
        console.log('✅ Test Order Created:', testOrder._id);
        console.log('👉 Go to Admin Dashboard to see if this appears.');
        console.log(`👉 Go to User Tracking: http://localhost:5173/track-order?orderId=${testOrder._id}`);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
