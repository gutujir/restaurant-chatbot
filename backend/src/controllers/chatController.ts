import { Request, Response } from "express";
import {
  addItemToCurrentOrder,
  cancelCurrentOrder,
  checkoutOrder,
  getCurrentOrder,
  getOrderHistory,
  getOrderByReference,
  markOrderPaid,
} from "../services/orderService";
import {
  getMenuItems,
  ensureMenuSeeded,
  findMenuItemByCode,
} from "../services/menuService";
import { IMenuItem } from "../models/MenuItem";
import Order from "../models/Order";
import { ensureSession } from "../middlewares/session";
import axios from "axios";

export const getMenu = async (_req: Request, res: Response) => {
  await ensureMenuSeeded();
  const menu = await getMenuItems();
  res.json({ menu });
};

export const chatHandler = async (req: Request, res: Response) => {
  // ensure session cookie exists
  const options = [
    "Select 1 to Place an order",
    "Select 99 to checkout order",
    "Select 98 to see order history",
    "Select 97 to see current order",
    "Select 0 to cancel order",
  ];

  const sid = await ensureSession(req, res);
  const inputRaw = String(req.body?.input ?? "").trim();
  if (!/^[0-9]+$/.test(inputRaw)) {
    return res.json({
      sid,
      message: "Invalid input. Please enter numbers only.",
      options,
    });
  }
  const input = parseInt(inputRaw, 10);

  switch (input) {
    case 1: {
      const menu = await getMenuItems();
      return res.json({
        sid,
        message: "Please select an item number to add to your order.",
        menu: menu.map((m: IMenuItem) => ({
          code: m.code,
          name: m.name,
          price: m.price,
        })),
      });
    }
    case 99: {
      const result = await checkoutOrder(sid);
      // When an order is placed, return pay instructions and reference
      if (result.reference) {
        return res.json({
          sid,
          ...result,
          message: `${result.message}. Use "Pay with Paystack" to complete payment. Reference: ${result.reference}`,
          payReference: result.reference,
        });
      }
      return res.json({ sid, ...result, options });
    }
    case 98: {
      const history = await getOrderHistory(sid);
      return res.json({ sid, history });
    }
    case 97: {
      const current = await getCurrentOrder(sid);
      return res.json({ sid, current });
    }
    case 0: {
      const result = await cancelCurrentOrder(sid);
      return res.json({ sid, ...result });
    }
    default: {
      // Treat as item selection (code corresponds to menu item code)
      const item = await findMenuItemByCode(input);
      if (!item) {
        return res.json({
          sid,
          message: "Invalid selection. Choose from the menu options.",
        });
      }
      await addItemToCurrentOrder(sid, item._id);
      const current = await getCurrentOrder(sid);
      return res.json({
        sid,
        message: `${item.name} added to your order.`,
        current,
      });
    }
  }
};

export const initializePayment = async (req: Request, res: Response) => {
  const sid = await ensureSession(req, res);
  const { reference } = req.body || {};

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret)
    return res.status(500).json({ message: "PAYSTACK_SECRET_KEY missing" });

  try {
    const order = reference
      ? await Order.findOne({ reference })
      : await Order.findOne({
          sid,
          status: { $in: ["placed", "pending"] },
        }).sort({ updatedAt: -1 });

    if (!order || order.sid !== sid)
      return res
        .status(404)
        .json({ message: "Order not found. Checkout first." });

    // If still pending, auto-place and create reference so payment can proceed
    if (order.status === "pending") {
      if (!order.items || order.items.length === 0)
        return res
          .status(400)
          .json({ message: "No items to pay for. Add items and checkout." });
      order.status = "placed" as const;
      if (!order.reference) order.reference = `${sid}-${Date.now()}`;
    }

    if (order.status === "paid")
      return res
        .status(400)
        .json({ message: "Order already paid", reference: order.reference });
    if (order.status !== "placed")
      return res
        .status(400)
        .json({
          message: `Order is not ready for payment (status: ${order.status})`,
        });

    const initRes = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        amount: Math.round(order.total * 100),
        email: `${sid}@example.local`,
        reference: order.reference,
        callback_url: `${process.env.CLIENT_URL}/chat?paid=1&ref=${order.reference}`,
      },
      { headers: { Authorization: `Bearer ${secret}` } },
    );

    // persist any new reference/status changes made above
    await order.save();

    return res.json({
      authorizationUrl: initRes.data?.data?.authorization_url,
      accessCode: initRes.data?.data?.access_code,
      reference: order.reference,
      message: "Proceed to Paystack to complete your payment.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const reference = String(req.query.reference || "");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret)
    return res.status(400).json({ message: "Missing reference or secret" });
  try {
    const order = await getOrderByReference(reference);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "paid")
      return res.json({ message: "Order already paid", status: "paid" });

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
      },
    );

    const status = verifyRes.data?.data?.status;
    if (status === "success") {
      await markOrderPaid(reference);
      return res.json({
        message: "Payment verified",
        status: "paid",
        reference,
      });
    }
    return res.status(400).json({ message: "Payment not successful", status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};
