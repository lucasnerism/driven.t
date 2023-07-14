import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import ticketsController from '@/controllers/tickets-controller';
import { ticketSchema } from '@/schemas/tickets-schemas';

const ticketRouter = Router();

ticketRouter
  .all('/*', authenticateToken)
  .get('/types', ticketsController.getTicketsTypes)
  .get('/', ticketsController.getTicket)
  .post('/', validateBody(ticketSchema), ticketsController.createTicket);

export { ticketRouter };
