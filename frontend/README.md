# 🖥️ Restaurant Chatbot - Frontend

The frontend interface for the Restaurant Chatbot, built with React, TypeScript, and Tailwind CSS. It provides a seamless, modern chat experience for ordering food.

## ⚙️ Setup & Installation

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `frontend` root:

    ```env
    VITE_API_URL=http://localhost:5001
    ```

    _Note: Ensure the port matches your backend server port._

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 🧩 Key Components

- **`App.tsx`**: The main application container that handles:
  - Chat history state.
  - WebSocket/HTTP communication with backend.
  - Session persistence (handled via HTTP-only cookies from backend).
  - Payment verification logic (checking URL parameters).

## 🎨 Features & UI

- **Glassmorphism Design**: Usage of backdrop-blur and semi-transparent backgrounds for a modern look.
- **Auto-Scroll**: Chat window automatically scrolls to the newest message.
- **Interactive Panels**:
  - **Menu Panel**: Shows available items and allows adding them directly.
  - **Current Order Panel**: Displays cart contents and total in real-time.
  - **History Panel**: Shows past orders.
- **Responsive**: "Quick Actions" buttons appear on smaller screens for easy navigation.

## 🔄 Payment Integration

The frontend handles the payment flow by:

1.  Receiving an authorization URL from the backend.
2.  Opening the Paystack payment page.
3.  Detecting the callback URL parameters (`?paid=1&ref=...`).
4.  Automatically triggering a verification call to the backend to confirm the payment.

## 🛠️ Scripts

- `npm run dev`: Start the development server (Vite).
- `npm run build`: Build the application for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint for code quality.
