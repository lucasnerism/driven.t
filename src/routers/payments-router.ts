import { Router } from 'express';
import { paymentSchema } from '@/schemas/payments-schemas';
import { authenticateToken, validateBody } from '@/middlewares';
import { getPayment, newPayment } from '@/controllers';

const paymentsRouter = Router();

paymentsRouter
  .all('/*', authenticateToken)
  .get('/', getPayment)
  .post('/process', validateBody(paymentSchema), newPayment);

export { paymentsRouter };
