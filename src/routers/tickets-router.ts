import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import ticketsController from '@/controllers/tickets-controller';
import { ticketSchema } from '@/schemas/tickets-schemas';

const ticketRouter = Router();

ticketRouter.use(authenticateToken);
ticketRouter.get('/types', ticketsController.getTicketsTypes);
ticketRouter.get('/', ticketsController.getTicket);
ticketRouter.post('/', validateBody(ticketSchema), ticketsController.createTicket);

export { ticketRouter };
