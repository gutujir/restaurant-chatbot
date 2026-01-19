import MenuItem, { IMenuItem } from "../models/MenuItem";

export const ensureMenuSeeded = async () => {
  const count = await MenuItem.countDocuments();
  if (count > 0) return;
  const items: Partial<IMenuItem>[] = [
    {
      code: 10,
      name: "Jollof Rice",
      price: 2500,
      description: "Served with chicken",
    },
    {
      code: 11,
      name: "Fried Rice",
      price: 2400,
      description: "Served with fish",
    },
    {
      code: 12,
      name: "Burger",
      price: 1800,
      description: "Beef burger with fries",
    },
    { code: 13, name: "Pizza Slice", price: 1500, description: "Cheese pizza" },
    { code: 14, name: "Salad", price: 1200, description: "Mixed veggies" },
  ];
  await MenuItem.insertMany(items);
};

export const getMenuItems = async () => {
  return MenuItem.find().sort({ code: 1 }).lean();
};

export const findMenuItemByCode = async (code: number) => {
  return MenuItem.findOne({ code });
};
