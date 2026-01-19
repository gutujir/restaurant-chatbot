import app from "./app";
import { connectDB } from "./config/connectDB";
import { ensureMenuSeeded } from "./services/menuService";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    await ensureMenuSeeded();
    app.listen(PORT, () => {
      console.log("Server is running on port: ", PORT);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to start server", message);
    process.exit(1);
  }
};

start();
