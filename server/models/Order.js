const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [
        {
            id: String,
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    paymentId: { type: String }, // Razorpay Payment ID
    orderId: { type: String },   // Razorpay Order ID or custom order ID
    status: {
        type: String,
        enum: ['received', 'preparing', 'out_for_delivery', 'delivered'],
        default: 'received'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
