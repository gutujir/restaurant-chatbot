# 🍽️ Restaurant Chatbot

A full-stack restaurant ordering chatbot application built with the MERN stack (MongoDB, Express, React, Node.js). It features a conversational interface for browsing menus, placing orders, and processing payments via Paystack.

## 🚀 Features

- **Interactive Chat Interface**: Browse dishes, add items, and manage your cart through a conversational UI.
- **Session Management**: Cookie-based sessions allow users to maintain their order state without explicit login.
- **Live Menu**: Fetches menu items directly from the backend database.
- **Real-time Order Updates**: instant feedback on order total and items.
- **Paystack Payment Integration**: Secure checkout flow with Paystack (Test Mode implemented).
- **Order History**: View past orders and their status (Placed, Paid, Cancelled).
- **Responsive Design**: Modern glassmorphism UI built with Tailwind CSS, fully responsive on mobile and desktop.

## 🛠️ Tech Stack

### Frontend

- **React** (Vite): Fast and modern UI library.
- **TypeScript**: Type-safety throughout the application.
- **Tailwind CSS**: Utility-first CSS framework for styling.

### Backend

- **Node.js & Express**: Robust server-side runtime and framework.
- **TypeScript**: Type-safety for backend logic.
- **MongoDB**: NoSQL database for storing sessions, orders, and menu items.
- **Mongoose**: ODM for MongoDB interaction.
- **Axios**: For making external API calls (Paystack).
- **Paystack API**: For handling payment transactions.

## 📂 Project Structure

```
restaurant-chatbot/
├── backend/            # Express Server & Database logic
├── frontend/           # React Client Application
├── README.md           # This file
└── SETUP.md            # Detailed setup instructions
```

## 🏁 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally or a cloud URI)

### 1. Setup Backend

```bash
cd backend
npm install
# Create .env file (see backend/README.md for details)
npm run dev
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install
# Create .env file (see frontend/README.md for details)
npm run dev
```

Visit `http://localhost:5173` to start ordering!

## 💳 Payment Testing

This project uses Paystack in Test Mode. You can use the following test card credentials:

- **Card Number**: `4084 0840 8408 4081`
- **Expiry**: Any future date (e.g., `12/30`)
- **CVV**: `123`

## 📄 Documentation

For more detailed documentation, please check the README files in the respective directories:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
