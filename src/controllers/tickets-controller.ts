import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ticketsService from '@/services/tickets-service';
import { AuthenticatedRequest } from '../middlewares';

async function getTicketsTypes(req: Request, res: Response) {
  const ticketTypes = await ticketsService.getTicketsTypes();
  res.status(httpStatus.OK).send(ticketTypes);
}

async function createTicket(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId }: { ticketTypeId: number } = req.body;
  const { userId } = req;
  const ticket = await ticketsService.createTicket(userId, ticketTypeId);
  res.status(httpStatus.CREATED).send(ticket);
}

async function getTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const ticket = await ticketsService.getTicket(userId);
  res.status(httpStatus.OK).send(ticket);
}

const ticketsController = {
  getTicketsTypes,
  createTicket,
  getTicket,
};

export default ticketsController;
