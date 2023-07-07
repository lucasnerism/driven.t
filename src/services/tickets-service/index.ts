import ticketsRepository from "@/repositories/tickets-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { conflictError, notFoundError } from "@/errors";

async function getTicketsTypes(){
  return await ticketsRepository.findTypes();
}

async function createTicket(userId:number,ticketTypeId:number){
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError()
  const ticket = await ticketsRepository.findUserTicket(enrollment.id)
  if(ticket) throw conflictError("There's already a ticket for this user")

  return await ticketsRepository.createTicket(enrollment.id,ticketTypeId)
}

async function getTicket(userId:number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) throw notFoundError()
  const ticket = await ticketsRepository.findUserTicket(enrollment.id)
  if(!ticket) throw notFoundError()
  return ticket
}

const ticketsService = {
  getTicketsTypes,
  createTicket,
  getTicket
}

export default ticketsService