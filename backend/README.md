Restaurant Chatbot Backend

Setup

- Copy `.env.example` to `.env` and fill values.
- Install deps: `npm install`
- Build: `npm run build`
- Dev: `npm run dev`

Environment

- PORT: server port (default 5000)
- MONGO_URI: MongoDB connection string
- CLIENT_URL: frontend URL (for Paystack callback)
- PAYSTACK_SECRET_KEY: Paystack test secret
- PAYSTACK_PUBLIC_KEY: Paystack test public (optional)

Endpoints

- GET `/api/menu`: list menu items with codes
- POST `/api/chat` body `{ input: string }`
  - `1`: returns menu to select items
  - `99`: checkout current order
  - `98`: order history
  - `97`: current order
  - `0`: cancel current order
  - any other number: adds matching menu item by `code`
- POST `/api/pay/init` body `{ total: number, reference: string }` → Paystack init
- GET `/api/pay/verify?reference=...` → verify Paystack payment

Session

- A cookie `sid` is set and used to store session and orders.
