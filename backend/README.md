# 🔙 Restaurant Chatbot - Backend

The backend service for the Restaurant Chatbot, built with Node.js, Express, and TypeScript. It handles session management, order processing, menu data, and Paystack payment integration.

## ⚙️ Setup & Installation

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` root with the following variables:

    ```env
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/restaurant-chatbot
    CLIENT_URL=http://localhost:5173
    PAYSTACK_SECRET_KEY=sk_test_... # Your Paystack Test Secret Key
    PAYSTACK_PUBLIC_KEY=pk_test_... # Your Paystack Test Public Key (Optional)
    ```

4.  **Run the server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5001`.

## 🗄️ Database Models

### Menu Item

- `code` (Number): Unique identifier for ordering (e.g., 10, 11).
- `name` (String): Name of the dish.
- `price` (Number): Price in Naira.
- `category` (String): e.g., "main", "desert".

### Order

- `sid` (String): Session ID of the user.
- `items` (Array): List of items in the order.
- `total` (Number): Total cost.
- `status` (String): `pending`, `placed`, `paid`, `cancelled`.
- `reference` (String): Unique transaction reference for Paystack.

### Session

- `sid` (String): Unique session identifier.
- `lastActive` (Date): Timestamp of last interaction.

## 📡 API Endpoints

### Chat & Orders

- `POST /api/chat`: Main interaction endpoint. Accepts `{ input: string }` and returns bot response.
- `GET /api/menu`: Returns list of all menu items.
- `GET /api/order/current`: Returns the current active order for the session.
- `GET /api/order/history`: Returns order history for the session.

### Payment

- `POST /api/pay/init`: Initializes a Paystack transaction. Returns authorization URL.
- `GET /api/pay/verify`: Verifies a transaction via reference.

## 💳 Payment Flow

1.  User selects items and chooses to Checkout (Option 99).
2.  Backend creates a `placed` order with a unique reference.
3.  User clicks "Pay with Paystack".
4.  Backend calls Paystack API to initialize transaction.
5.  Frontend redirects user to Paystack payment page.
6.  Upon success, user is redirected back to `CLIENT_URL`.
7.  Backend verifies the transaction using the reference and updates order status to `paid`.

## 🛠️ Scripts

- `npm run dev`: Runs the server in development mode with `nodemon`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled JavaScript in production.
- `npm run clean`: Removes the `dist` directory.
