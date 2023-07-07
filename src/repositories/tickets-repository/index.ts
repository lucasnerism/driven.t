import { prisma } from '@/config';

async function findTypes() {
  return prisma.ticketType.findMany();
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return prisma.ticket.create({
    data: { enrollmentId, ticketTypeId, status: 'RESERVED' },
    include: { TicketType: true },
  });
}

async function findUserTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: { enrollmentId },
    include: { TicketType: true },
  });
}

async function findTicketById(id: number) {
  return prisma.ticket.findFirst({
    where: { id },
    include: { TicketType: true },
  });
}

async function updateTicketById(id: number) {
  return prisma.ticket.update({
    where: { id },
    data: { status: 'PAID' },
  });
}

const ticketsRepository = {
  findTypes,
  createTicket,
  findUserTicket,
  findTicketById,
  updateTicketById,
};

export default ticketsRepository;
