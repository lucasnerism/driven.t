import { notFoundError, unauthorizedError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import paymentsRepository from '@/repositories/payments-repository';

async function newPayment(userId: number, body: { ticketId: number; cardIssuer: string; cardLastDigits: string }) {
  const { ticketId } = body;
  const ticket = await validateTicket(userId, ticketId);
  const payment = await paymentsRepository.createPayment({ ...body, value: ticket.TicketType.price });
  await ticketsRepository.updateTicketById(ticketId);
  return payment;
}

async function getPayment(userId: number, ticketId: number) {
  await validateTicket(userId, ticketId);
  return await paymentsRepository.findPayment(ticketId);
}

async function validateTicket(userId: number, ticketId: number) {
  const ticket = await ticketsRepository.findTicketById(ticketId);
  if (!ticket) throw notFoundError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (ticket.enrollmentId !== enrollment.id) throw unauthorizedError();
  return ticket;
}

const paymentsService = {
  newPayment,
  getPayment,
};

export default paymentsService;
