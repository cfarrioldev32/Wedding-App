import { WishModel } from '../models/wish.model';

export const createWish = async (payload: {
  email: string;
  country: string;
  reason: string;
  ipHash?: string;
}): Promise<{ id: string; createdAt: Date }> => {
  const wish = await WishModel.create({
    email: payload.email,
    country: payload.country,
    reason: payload.reason,
    ipHash: payload.ipHash
  });

  return { id: wish.id, createdAt: wish.createdAt };
};

export const listWishes = async (page: number, limit: number) => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    WishModel.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    WishModel.countDocuments()
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total
  };
};

export const deleteWish = async (id: string): Promise<boolean> => {
  const result = await WishModel.findByIdAndDelete(id);
  return Boolean(result);
};
