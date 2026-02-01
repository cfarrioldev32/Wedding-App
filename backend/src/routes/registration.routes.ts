import { Router } from 'express';
import { createRegistration, listRegistrations } from '../controllers/registration.controller';
import { validateBody } from '../middleware/validate';
import { registrationSchema } from '../schemas/registration.schema';
import { requireAdmin } from '../middleware/auth';

export const registrationRouter = Router();

registrationRouter.post('/', validateBody(registrationSchema), createRegistration);
registrationRouter.get('/', requireAdmin, listRegistrations);
