const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/spice_route";

mongoose.connect(MONGODB_URI)
    .then(async () => {
        const order = await Order.findOne().sort({ createdAt: -1 });
        if (order) {
            console.log(`TYPE:Latest Order URL`);
            console.log(`URL:http://localhost:5173/track-order?orderId=${order._id}`);
        } else {
            console.log("No orders found.");
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
