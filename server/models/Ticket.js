const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    orderId: { type: String, required: false }, // Optional
    email: { type: String },
    category: {
        type: String,
        required: true,
        enum: ['Late Delivery', 'Missing Item', 'Quality Issue', 'Other']
    },
    details: { type: String },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
