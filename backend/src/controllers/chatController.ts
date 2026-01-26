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
import {
  validatePaystackConfig,
  initializePaystackTransaction,
  verifyPaystackTransaction,
  nairaToKobo,
  PAYSTACK_CONFIG,
} from "../config/paystack";

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
      message:
        "Invalid input. Please enter numbers only.\n\n" + options.join("\n"),
      options,
    });
  }
  const input = parseInt(inputRaw, 10);

  // Validate number range
  if (input < 0 || input > 1000) {
    return res.json({
      sid,
      message:
        "Invalid selection. Please choose a valid option.\n\n" +
        options.join("\n"),
      options,
    });
  }

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
          message: `${result.message}! 🎉\n\nTotal: ₦${result.total}\nReference: ${result.reference}\n\nUse "Pay with Paystack" button to complete payment.\n\nAfter payment, you can:\n• Select 1 to place a new order\n• Select 98 to see order history`,
          payReference: result.reference,
        });
      }
      return res.json({
        sid,
        ...result,
        message: result.message + "\n\n" + options.join("\n"),
        options,
      });
    }
    case 98: {
      const history = await getOrderHistory(sid);
      const message =
        history.length > 0
          ? `You have ${history.length} order(s) in your history.`
          : "No order history yet. Select 1 to place your first order!";
      return res.json({ sid, history, message });
    }
    case 97: {
      const current = await getCurrentOrder(sid);
      const message =
        current.items && current.items.length > 0
          ? `Your current order has ${current.items.length} item(s). Total: ₦${current.total}`
          : "Your cart is empty. Select 1 to browse the menu!";
      return res.json({ sid, current, message });
    }
    case 0: {
      const result = await cancelCurrentOrder(sid);
      const message = result.message.includes("No current order")
        ? result.message + " Select 1 to start a new order."
        : result.message + " ✓\n\nSelect 1 to place a new order.";
      return res.json({ sid, message, options });
    }
    default: {
      // Treat as item selection (code corresponds to menu item code)
      const item = await findMenuItemByCode(input);
      if (!item) {
        return res.json({
          sid,
          message:
            "Invalid selection. That item doesn't exist.\n\nSelect 1 to see the menu, or choose from these options:\n" +
            options.join("\n"),
          options,
        });
      }
      await addItemToCurrentOrder(sid, item._id);
      const current = await getCurrentOrder(sid);
      return res.json({
        sid,
        message: `✓ ${item.name} added to your order (₦${item.price})\n\nCurrent total: ₦${current.total}\n\nContinue adding items or select 99 to checkout.`,
        current,
      });
    }
  }
};

export const initializePayment = async (req: Request, res: Response) => {
  const sid = await ensureSession(req, res);
  const { reference } = req.body || {};

  // Validate Paystack configuration
  const configValidation = validatePaystackConfig();
  if (!configValidation.isValid) {
    return res.status(500).json({ message: configValidation.error });
  }

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
      return res.status(400).json({
        message: `Order is not ready for payment (status: ${order.status})`,
      });

    // Ensure reference exists (it should always exist at this point)
    if (!order.reference) {
      order.reference = `${sid}-${Date.now()}`;
    }

    // Initialize Paystack transaction
    const paystackResponse = await initializePaystackTransaction({
      amount: nairaToKobo(order.total),
      email: `${sid}@example.local`,
      reference: order.reference, // Now guaranteed to be string
      callbackUrl: `${PAYSTACK_CONFIG.callbackUrl}/chat?paid=1&ref=${order.reference}`,
    });

    // persist any new reference/status changes made above
    await order.save();

    return res.json({
      authorizationUrl: paystackResponse.authorizationUrl,
      accessCode: paystackResponse.accessCode,
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

  // Validate Paystack configuration
  const configValidation = validatePaystackConfig();
  if (!configValidation.isValid) {
    return res.status(500).json({ message: configValidation.error });
  }

  if (!reference) {
    return res.status(400).json({ message: "Missing payment reference" });
  }

  try {
    const order = await getOrderByReference(reference);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "paid")
      return res.json({ message: "Order already paid", status: "paid" });

    // Verify transaction with Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);

    if (paystackResponse.status === "success") {
      await markOrderPaid(reference);
      return res.json({
        message: "Payment verified",
        status: "paid",
        reference,
      });
    }
    return res.status(400).json({
      message: "Payment not successful",
      status: paystackResponse.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ message });
  }
};
