import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();

const devOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
const prodOrigin = process.env.CLIENT_URL;
const allowedOrigins = [...devOrigins];
if (prodOrigin) allowedOrigins.push(prodOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS DEBUG: Received origin:", origin);
      console.log("CORS DEBUG: Allowed origins:", allowedOrigins);
      if (!origin) return callback(null, true); // allow mobile apps / curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.error("CORS DEBUG: Origin blocked:", origin);
      return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept"],
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Restaurant ChatBot API is running!" });
});

// Routes
app.use("/api", chatRoutes);

export default app;
