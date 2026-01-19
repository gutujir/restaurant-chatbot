import Order, { IOrderItem } from "../models/Order";
import MenuItem from "../models/MenuItem";

export const getCurrentOrder = async (sid: string) => {
  const order = await Order.findOne({
    sid,
    status: { $in: ["pending"] },
  }).populate("items.item");
  if (!order) return { items: [], total: 0, status: "none" };
  return {
    items: order.items,
    total: order.total,
    status: order.status,
    reference: order.reference,
  };
};

export const addItemToCurrentOrder = async (sid: string, itemId: any) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new Error("Menu item not found");
  let order = await Order.findOne({ sid, status: { $in: ["pending"] } });
  if (!order)
    order = new Order({ sid, items: [], total: 0, status: "pending" });
  const existing = order.items.find(
    (i: IOrderItem) => String(i.item) === String(itemId),
  );
  if (existing) existing.qty += 1;
  else order.items.push({ item: itemId, qty: 1 });
  order.total += item.price;
  await order.save();
  return order;
};

export const cancelCurrentOrder = async (sid: string) => {
  const order = await Order.findOne({ sid, status: "pending" });
  if (!order) return { message: "No current order to cancel" };
  order.status = "cancelled";
  await order.save();
  return { message: "Order cancelled" };
};

export const checkoutOrder = async (sid: string) => {
  const order = await Order.findOne({ sid, status: "pending" });
  if (!order || order.items.length === 0)
    return { message: "No order to place" };
  if (order.status === "paid")
    return {
      message: "Order already paid",
      total: order.total,
      reference: order.reference,
    };
  order.status = "placed";
  if (!order.reference) order.reference = `${sid}-${Date.now()}`;
  await order.save();
  return {
    message: "Order placed",
    total: order.total,
    reference: order.reference,
  };
};

export const getOrderHistory = async (sid: string) => {
  const orders = await Order.find({
    sid,
    status: { $in: ["placed", "paid", "cancelled"] },
  }).sort({ createdAt: -1 });
  return orders;
};

export const getOrderByReference = async (reference: string) => {
  return Order.findOne({ reference });
};

export const markOrderPaid = async (reference: string) => {
  const order = await Order.findOne({ reference });
  if (!order) return null;
  order.status = "paid";
  order.paidAt = new Date();
  await order.save();
  return order;
};
