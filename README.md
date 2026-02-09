# Spice Route - Full Stack Restaurant App 🌶️

A premium, production-ready online food ordering system with a React Frontend and Node.js/Express Backend.

## 📂 Project Structure
- **`/client`**: The React Frontend (UI, Animations, Stripe/Razorpay UI).
- **`/server`**: The Node.js Backend (API, Database, Socket.io).

---

## 🚀 Quick Start Guide

To run this application locally, you need to open **Two Terminal Windows**.

### terminal 1: Start the Backend (API)
This handles payments, database, and live tracking updates.
```bash
cd server
npm install
npm start
```
*You should see: `🚀 Server running on port 5000` and `✅ Connected to MongoDB`*

### terminal 2: Start the Frontend (UI)
This runs the website interface.
```bash
cd client
npm install
npm run dev
```
*You should see a link like: `http://localhost:5173`*

---

## 🔑 Environment Variables
You need to creating a `.env` file in the **`/server`** folder with the following keys (a template is provided):

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## ☁️ Deployment
For deployment instructions (Vercel + Render), please check:
[Deployment Guide](./client/DEPLOYMENT.md) (or check the artifacts folder).
"# kal_website" 
