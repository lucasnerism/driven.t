import ticketsRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { conflictError, notFoundError } from '@/errors';
import { Ticket, TicketType } from '@prisma/client';

async function getTicketsTypes() {
  const ticketTypes: TicketType[] = await ticketsRepository.findTypes();
  if (!ticketTypes) throw notFoundError();
  return ticketTypes;
}

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findUserTicket(enrollment.id);
  if (ticket) throw conflictError("There's already a ticket for this user");

  return await ticketsRepository.createTicket(enrollment.id, ticketTypeId);
}

async function getTicket(userId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findUserTicket(enrollment.id);
  if (!ticket) throw notFoundError();
  return ticket;
}

const ticketsService = {
  getTicketsTypes,
  createTicket,
  getTicket,
};

export default ticketsService;
