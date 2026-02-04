# Spice Route - Modern Indian Cuisine Website

## Overview
Spice Route is a premium, responsive web application for an Indian restaurant. It features a modern dark-mode aesthetic, animations, and a full online ordering workflow (Menu selection, Cart management, Checkout simulation, and Order Tracking).

**Built With:** React (Vite), Tailwind CSS, Framer Motion, Zustand.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher) installed on your system.

## 📂 Project Structure
- **`/client`**: Frontend (React + Vite). User interface and animations.
- **`/server`**: Backend (Node.js + Express). API, Database, and Socket.io.

## 🚀 Quick Start
You need to run **both** the frontend and backend.

### 1. Start Backend
```bash
cd server
npm install
npm start
```
*(Runs on localhost:5000)*

### 2. Start Frontend
```bash
cd client
npm install
npm run dev
```
*(Runs on localhost:5173)*

## ☁️ Deployment
See the [Deployment Guide](DEPLOYMENT.md) for instructions on how to push to Vercel and Render.

---

## 🛠 Troubleshooting
- **Database:** Ensure MongoDB is running or update `MONGODB_URI` in `server/.env`.
- **Payments:** Ensure Razorpay Keys are in `server/.env`.

