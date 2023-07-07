import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import ticketsController from "@/controllers/tickets-controller";
import { ticketSchema } from "@/schemas/tickets-schemas";

const ticketRouter = Router();

ticketRouter.get('/types', authenticateToken, ticketsController.getTicketsTypes)
ticketRouter.get('/', authenticateToken,ticketsController.getTicket)
ticketRouter.post('/', authenticateToken, validateBody(ticketSchema),ticketsController.createTicket)

export {ticketRouter}