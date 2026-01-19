# Setup Instructions

## Step-by-Step Setup Guide

### 1. Clone and Navigate

```bash
cd "AltSchool /restaurant-chatbot"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit backend/.env with your values:
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant-chatbot
CLIENT_URL=http://localhost:5173
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Build TypeScript
npm run build

# Start development server
npm run dev
```

**Backend will run on:** `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Edit frontend/.env with:
VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

### 4. MongoDB Setup

Ensure MongoDB is running:

**Option A: Local MongoDB**

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath /path/to/data/directory
```

**Option B: MongoDB Atlas**

- Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Update `MONGO_URI` in backend/.env

### 5. Paystack Setup

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)
5. Update backend/.env with these keys

### 6. Test the Application

1. Open browser to `http://localhost:5173`
2. You should see the chatbot welcome message
3. Type `1` to view the menu
4. Type a menu item code (e.g., `10`) to add to cart
5. Type `97` to view current order
6. Type `99` to checkout
7. Click "Pay with Paystack" and use test card:
   - Card: `4084 0840 8408 4081`
   - Expiry: Any future date
   - CVV: Any 3 digits
8. After payment, click "Verify payment"

## Verification Checklist

- [ ] Backend builds without errors (`npm run build`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] MongoDB connection successful (check backend logs)
- [ ] Backend server starts on port 5000
- [ ] Frontend dev server starts on port 5173
- [ ] Can access chatbot UI in browser
- [ ] Menu items load (type `1`)
- [ ] Can add items to cart
- [ ] Can checkout order (type `99`)
- [ ] Paystack payment window opens
- [ ] Payment verification works

## Common Issues

### "Cannot connect to MongoDB"

- Ensure MongoDB is running
- Check MONGO_URI format: `mongodb://localhost:27017/database-name`
- For Atlas: ensure IP whitelist includes your IP

### "CORS error" in browser console

- Verify backend CLIENT_URL matches frontend URL
- Check backend is running on correct port
- Ensure `credentials: "include"` in frontend fetch calls

### "Paystack keys invalid"

- Verify you're using TEST keys (not live keys)
- Keys should start with `sk_test_` and `pk_test_`
- Check for extra spaces in .env file

### Port already in use

```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in backend/.env
PORT=5001
```

## Production Deployment

### Backend (e.g., Railway, Render, Heroku)

1. Set environment variables in hosting platform
2. Ensure `NODE_ENV=production`
3. Use production MongoDB connection string
4. Use production Paystack keys (starts with `sk_live_`)
5. Update CLIENT_URL to production frontend URL

### Frontend (e.g., Vercel, Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_URL` to production backend URL
4. Configure CORS on backend to allow production domain

## Development Tips

### Hot Reload

- Backend: Uses nodemon, auto-restarts on file changes
- Frontend: Vite HMR, instant updates in browser

### Debugging

- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Open browser DevTools console
- Network requests: Check DevTools Network tab

### Database Inspection

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use restaurant-chatbot

# View collections
show collections

# View menu items
db.menuitems.find().pretty()

# View orders
db.orders.find().pretty()

# View sessions
db.sessions.find().pretty()
```

### Reset Database

```bash
mongosh
use restaurant-chatbot
db.dropDatabase()
# Restart backend to reseed menu
```

## Next Steps

- Customize menu items in `backend/src/services/menuService.ts`
- Modify UI styling in `frontend/src/App.tsx` and `frontend/src/App.css`
- Add more features (order scheduling, ratings, etc.)
- Implement proper logging and monitoring
- Add unit and integration tests

---

**Need help?** Check the main README.md for detailed documentation.
