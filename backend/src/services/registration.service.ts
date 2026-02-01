import { RegistrationModel } from '../models/registration.model';

export const createRegistration = async (payload: {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
}): Promise<{ id: string; createdAt: Date }> => {
  const registration = await RegistrationModel.create({
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    country: payload.country
  });

  return { id: registration.id, createdAt: registration.createdAt };
};

export const listRegistrations = async (page: number, limit: number) => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    RegistrationModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    RegistrationModel.countDocuments()
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total
  };
};
