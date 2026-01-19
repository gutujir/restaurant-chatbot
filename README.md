# Restaurant ChatBot

A full-stack restaurant ordering chatbot with session-based ordering, Paystack payment integration, and a modern chat interface.

## 🎯 Features

### Core Functionality

- ✅ **Chat-style interface** - Interactive bot conversation flow
- ✅ **Session-based ordering** - Device-specific sessions via cookies (no authentication required)
- ✅ **Menu browsing** - View restaurant menu items with prices
- ✅ **Order management** - Add items, view current order, checkout, cancel
- ✅ **Order history** - View all past orders
- ✅ **Payment integration** - Paystack test mode for secure payments
- ✅ **Input validation** - Numeric-only inputs, invalid selection rejection
- ✅ **Duplicate payment prevention** - Orders can only be paid once

### Technical Features

- 🔒 **Session isolation** - Each device maintains separate order state
- 🛡️ **Validation** - Comprehensive input and state validation
- 🎨 **Modern UI** - Tailwind CSS with glassmorphism design
- 📱 **Responsive** - Mobile-first design
- 🔄 **Real-time updates** - Auto-refresh order state
- 🚀 **Production-ready** - TypeScript, modular architecture, error handling

## 🏗️ Architecture

```
restaurant-chatbot/
├── backend/                 # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose schemas (MenuItem, Order, Session)
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (menu, order)
│   │   ├── middlewares/     # Session management
│   │   ├── config/          # Database connection
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts         # Server entry point
│   └── package.json
│
└── frontend/                # React + Vite + Tailwind
    ├── src/
    │   ├── App.tsx          # Main chat UI component
    │   ├── App.css          # Custom styles
    │   └── index.css        # Tailwind imports
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB running locally or connection string
- Paystack test account (get keys from [paystack.com](https://paystack.com))

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
#   MONGO_URI=mongodb://localhost:27017/restaurant-chatbot
#   PAYSTACK_SECRET_KEY=sk_test_xxx
#   PAYSTACK_PUBLIC_KEY=pk_test_xxx (optional)
#   CLIENT_URL=http://localhost:5173
#   PORT=5000

# Build TypeScript
npm run build

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
#   VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📖 Usage Guide

### Chat Commands

When you open the chatbot, you'll see these options:

| Command | Action        | Description                                        |
| ------- | ------------- | -------------------------------------------------- |
| `1`     | Place order   | View menu and select items                         |
| `99`    | Checkout      | Place your current order and get payment reference |
| `98`    | Order history | View all past orders (placed, paid, cancelled)     |
| `97`    | Current order | View items in your current cart                    |
| `0`     | Cancel order  | Cancel your current pending order                  |
| `10-14` | Add item      | Add menu item by code (after selecting option 1)   |

### Order Flow

1. **Browse Menu**: Type `1` → Bot shows menu with item codes
2. **Add Items**: Type item code (e.g., `10` for Jollof Rice) → Item added to cart
3. **View Cart**: Type `97` → See current order total
4. **Checkout**: Type `99` → Order placed, payment reference generated
5. **Pay**: Click "Pay with Paystack" → Redirected to Paystack
6. **Verify**: After payment, click "Verify payment" → Order marked as paid

### Menu Items (Default)

| Code | Item                       | Price  |
| ---- | -------------------------- | ------ |
| 10   | Jollof Rice (with chicken) | ₦2,500 |
| 11   | Fried Rice (with fish)     | ₦2,400 |
| 12   | Burger (beef with fries)   | ₦1,800 |
| 13   | Pizza Slice (cheese)       | ₦1,500 |
| 14   | Salad (mixed veggies)      | ₦1,200 |

## 🔌 API Endpoints

### Menu

- `GET /api/menu` - Get all menu items

### Chat

- `POST /api/chat` - Send chat input
  ```json
  { "input": "1" }
  ```

### Payment

- `POST /api/pay/init` - Initialize Paystack payment
  ```json
  { "reference": "order-reference" }
  ```
- `GET /api/pay/verify?reference=xxx` - Verify payment status

## 🛡️ Validation Rules

### Input Validation

- ✅ Only numeric inputs accepted
- ✅ Invalid menu selections rejected
- ✅ Empty orders cannot be checked out
- ✅ Cancelled orders cannot be paid

### Payment Validation

- ✅ Orders must be "placed" before payment
- ✅ Duplicate payments prevented
- ✅ Payment reference tied to specific order
- ✅ Session ownership verified

### Session Isolation

- ✅ Each device gets unique session ID (cookie-based)
- ✅ Orders isolated per session
- ✅ No cross-session data leakage

## 🗄️ Database Schema

### Session

```typescript
{
  sid: string(unique);
  lastSeenAt: Date;
  userAgent: string;
}
```

### MenuItem

```typescript
{
  code: number(unique);
  name: string;
  price: number;
  description: string;
}
```

### Order

```typescript
{
  sid: string (session reference)
  items: [{ item: ObjectId, qty: number }]
  total: number
  status: "pending" | "placed" | "paid" | "cancelled"
  reference: string (payment reference)
  paidAt: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 UI Features

- **Glassmorphism design** - Modern frosted glass effect
- **Dark theme** - Easy on the eyes with gradient background
- **Quick actions** - One-click buttons for common commands
- **Auto-scroll** - Chat automatically scrolls to latest message
- **Responsive layout** - Works on mobile, tablet, desktop
- **Real-time updates** - Order state syncs across panels
- **Loading states** - Visual feedback during API calls

## 🧪 Testing with Paystack

1. Get test keys from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Use test card: `4084 0840 8408 4081` (any future expiry, any CVV)
3. Payment flow:
   - Checkout order → Get reference
   - Click "Pay with Paystack" → Opens Paystack popup
   - Enter test card details → Complete payment
   - Return to chat → Click "Verify payment"
   - Order status updates to "paid"

## 📦 Production Deployment

### Backend

```bash
npm run build
npm start
```

Set production environment variables:

- `MONGO_URI` - Production MongoDB connection
- `PAYSTACK_SECRET_KEY` - Production Paystack key
- `CLIENT_URL` - Production frontend URL
- `NODE_ENV=production`

### Frontend

```bash
npm run build
# Deploy dist/ folder to hosting (Vercel, Netlify, etc.)
```

Set `VITE_API_URL` to production backend URL.

## 🔧 Development Scripts

### Backend

- `npm run dev` - Start with nodemon (auto-reload)
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm run clean` - Remove dist folder

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Backend won't start

- ✅ Check MongoDB is running: `mongod` or connection string is valid
- ✅ Verify `.env` file exists with all required variables
- ✅ Run `npm install` to ensure dependencies are installed

### Frontend can't connect to backend

- ✅ Check backend is running on port 5000
- ✅ Verify `VITE_API_URL` in frontend `.env`
- ✅ Check CORS settings in `backend/src/app.ts`

### Payment not working

- ✅ Verify Paystack test keys are set in backend `.env`
- ✅ Use test card: `4084 0840 8408 4081`
- ✅ Check browser console for errors
- ✅ Ensure order is "placed" before payment

### Session not persisting

- ✅ Check cookies are enabled in browser
- ✅ Verify `credentials: "include"` in frontend fetch calls
- ✅ Check `cookieParser()` middleware is active in backend

## 📝 License

MIT

## 👨‍💻 Author

Built as a full-stack restaurant chatbot demonstration project.

---

**Note**: This is a demonstration project using Paystack test mode. For production use, implement additional security measures, rate limiting, and proper error logging.
