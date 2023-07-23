import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../middlewares';
import paymentsService from '@/services/payments-service';
import { invalidQueryError } from '@/errors';

export async function newPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId, cardData } = req.body;
  const { issuer: cardIssuer } = cardData;
  const cardLastDigits = cardData.number.slice(-4);
  const payment = await paymentsService.newPayment(userId, { ticketId, cardIssuer, cardLastDigits });
  res.status(httpStatus.OK).send(payment);
}

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId }: { ticketId?: string } = req.query;
  if (!ticketId) throw invalidQueryError('Ticket id value not valid');

  const ticketIdQuery = parseInt(ticketId);
  if (ticketIdQuery <= 0 || isNaN(ticketIdQuery)) throw invalidQueryError('Ticket id value not valid');
  const payment = await paymentsService.getPayment(userId, ticketIdQuery);
  res.status(httpStatus.OK).send(payment);
}
