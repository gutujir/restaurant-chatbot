import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("mongo_uri: ", mongoUri);
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error connection to MongoDB: ", message);
    process.exit(1); // failure, 0 status code is success
  }
};
