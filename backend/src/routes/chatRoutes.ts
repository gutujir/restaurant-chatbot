import { Router } from "express";
import {
  chatHandler,
  initializePayment,
  verifyPayment,
  getMenu,
} from "../controllers/chatController";

const router = Router();

router.get("/menu", getMenu);
router.post("/chat", chatHandler);
router.post("/pay/init", initializePayment);
router.get("/pay/verify", verifyPayment);

export default router;
