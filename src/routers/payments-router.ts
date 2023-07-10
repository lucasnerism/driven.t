import { Router } from 'express';
import { paymentSchema } from '@/schemas/payments-schemas';
import paymentsController from '@/controllers/payments-controller';
import { authenticateToken, validateBody } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter.use(authenticateToken);
paymentsRouter.get('/', paymentsController.getPayment);
paymentsRouter.post('/process', validateBody(paymentSchema), paymentsController.newPayment);

export { paymentsRouter };
