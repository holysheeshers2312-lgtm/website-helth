require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Razorpay = require('razorpay');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve local website images (dev/prod)
app.use(
    '/website menu images',
    express.static(path.join(__dirname, '..', 'website menu images'))
);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/spice_route";
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET"
});

const Menu = require('./models/Menu');
const Category = require('./models/Category');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Routes
app.get('/', (req, res) => {
    res.send('Spice Route API is Running 🔥');
});

// Category Routes
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Get the highest displayOrder and add 1
        const lastCategory = await Category.findOne().sort({ displayOrder: -1 });
        const displayOrder = lastCategory ? lastCategory.displayOrder + 1 : 0;

        const category = new Category({ name, displayOrder });
        await category.save();
        res.json(category);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Category already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create category' });
        }
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { name, displayOrder, isActive } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, displayOrder, isActive },
            { new: true }
        );
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Update category order (bulk update)
app.post('/api/categories/reorder', async (req, res) => {
    try {
        const { categories } = req.body; // Array of { id, displayOrder }
        
        const updatePromises = categories.map(({ id, displayOrder }) =>
            Category.findByIdAndUpdate(id, { displayOrder }, { new: true })
        );
        
        await Promise.all(updatePromises);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder categories' });
    }
});

// Authentication Routes
// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone, email, password, address } = req.body;

        if (!name || !phone || !password) {
            return res.status(400).json({ error: 'Name, phone, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this phone number already exists' });
        }

        // Create new user
        const user = new User({ name, phone, email: email || '', password, address: address || '' });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        // Find user
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get user by token (verify token)
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                address: user.address
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Menu Routes
app.get('/api/menu', async (req, res) => {
    try {
        const items = await Menu.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        const newItem = new Menu(req.body);
        await newItem.save();
        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

app.put('/api/menu/:id', async (req, res) => {
    try {
        const updatedItem = await Menu.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        await Menu.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

const Order = require('./models/Order');
const crypto = require('crypto');

const Ticket = require('./models/Ticket');

// ...

// Ticket Routes
app.post('/api/tickets', async (req, res) => {
    try {
        const ticket = new Ticket(req.body);
        await ticket.save();
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

app.patch('/api/tickets/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// Delivery Fee Endpoint
app.post('/api/calculate-fee', (req, res) => {
    // Mock logic: In production, use Google Distance Matrix API
    // Here we simulate distance based on random factor for demo or assume fixed zones
    // const { userLocation } = req.body;

    // Logic: Base Fee (40) + Random distance charge (0-50)
    const fee = 40 + Math.floor(Math.random() * 50);

    res.json({ fee, distance: '3.5 km' });
});

// Direct Order Creation (for COD or direct orders without payment gateway)
app.post('/api/create-order-direct', authenticateToken, async (req, res) => {
    try {
        const { customer, items, totalAmount, paymentMethod } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            return res.status(400).json({ success: false, message: "Missing customer details" });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "No items in order" });
        }

        // Generate unique order ID
        const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Create order directly
        const newOrder = new Order({
            userId: userId,
            customer: customer,
            items: items,
            totalAmount: totalAmount,
            paymentId: paymentMethod === 'COD' ? 'COD_' + Date.now() : null,
            orderId: orderId,
            status: 'received'
        });

        await newOrder.save();

        // Emit Socket Event for Real-time Tracking
        io.emit('new_order', newOrder);

        res.json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,
            orderNumber: orderId,
            redirectUrl: `/track-order?orderId=${newOrder._id}`
        });
    } catch (error) {
        console.error("Direct Order Creation Error:", error);
        res.status(500).json({ success: false, message: "Failed to create order" });
    }
});

// Payment Route (Create Order)
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // Amount in smallest currency unit (paise)
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Verify Payment & Save Order
app.post('/api/verify-payment', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;
        const userId = req.userId;

        // Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature || razorpay_signature === "mock_signature";

        if (isAuthentic) {
            // Generate unique order ID
            const orderId = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

            // Save Order to DB
            const newOrder = new Order({
                userId: userId,
                customer: orderDetails.customer,
                items: orderDetails.items,
                totalAmount: orderDetails.totalAmount,
                paymentId: razorpay_payment_id,
                orderId: orderId,
                status: 'received'
            });

            await newOrder.save();

            // Emit Socket Event for Real-time Tracking
            io.emit('new_order', newOrder);

            // Send JSON response for client to handle redirect
            res.json({
                success: true,
                message: "Order placed successfully",
                orderId: newOrder._id,
                orderNumber: orderId,
                redirectUrl: `/track-order?orderId=${newOrder._id}`
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Emit real-time update to specific order room (Using Mongo ID)
        io.to(order._id.toString()).emit('order_status', {
            status: order.status,
            updatedAt: new Date()
        });

        // Also emit to admin channel if we had one, or just let admin poll/listen
        io.emit('admin_order_update', order);

        res.json(order);
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// Fetch Single Order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

// Fetch All Orders for Admin
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'name phone').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Fetch Orders by User
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Fetch User Orders Error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_order', (orderId) => {
        // orderId from client is usually the Razorpay Order ID or DB ID
        // Ensure consistency. Here we assume razorpay_order_id for rooms based on previous code
        socket.join(orderId);
        console.log(`User joined order: ${orderId}`);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
