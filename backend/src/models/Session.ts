import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISession extends Document {
  sid: string;
  lastSeenAt: Date;
  userAgent?: string;
}

const SessionSchema = new Schema<ISession>({
  sid: { type: String, required: true, unique: true },
  lastSeenAt: { type: Date, default: Date.now },
  userAgent: { type: String },
});

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
export default Session;
