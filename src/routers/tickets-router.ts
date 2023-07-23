import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { ticketSchema } from '@/schemas/tickets-schemas';
import { createTicket, getTicket, getTicketsTypes } from '@/controllers';

const ticketRouter = Router();

ticketRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketsTypes)
  .get('/', getTicket)
  .post('/', validateBody(ticketSchema), createTicket);

export { ticketRouter };
