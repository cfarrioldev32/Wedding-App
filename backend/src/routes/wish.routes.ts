import { Router } from 'express';
import { createWish, deleteWish, listWishes } from '../controllers/wish.controller';
import { validateBody } from '../middleware/validate';
import { wishSchema } from '../schemas/wish.schema';
import { wishRateLimiter } from '../middleware/rate-limit';
import { requireAdmin } from '../middleware/auth';

export const wishRouter = Router();

wishRouter.post('/', wishRateLimiter, validateBody(wishSchema), createWish);
wishRouter.get('/', requireAdmin, listWishes);
wishRouter.delete('/:id', requireAdmin, deleteWish);
