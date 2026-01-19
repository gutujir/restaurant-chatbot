import { Request, Response } from "express";
import crypto from "crypto";
import Session from "../models/Session";

export const ensureSession = async (req: Request, res: Response) => {
  let sid = req.cookies?.sid as string | undefined;
  if (!sid) {
    sid = crypto.randomUUID();
    res.cookie("sid", sid, { httpOnly: true, sameSite: "lax" });
  }
  // Upsert session in DB
  await Session.findOneAndUpdate(
    { sid },
    { sid, lastSeenAt: new Date(), userAgent: req.headers["user-agent"] ?? "" },
    { upsert: true, new: true },
  );
  return sid;
};
