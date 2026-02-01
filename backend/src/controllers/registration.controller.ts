import { Request, Response } from 'express';
import * as registrationService from '../services/registration.service';

export const createRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, firstName, lastName, country } = req.body as {
    email: string;
    firstName: string;
    lastName: string;
    country: string;
  };
  const result = await registrationService.createRegistration({
    email,
    firstName,
    lastName,
    country
  });
  res.status(201).json({ id: result.id, createdAt: result.createdAt.toISOString() });
};

export const listRegistrations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await registrationService.listRegistrations(page, limit);
  res.json(result);
};
