import { Hotel } from '@prisma/client';
import { notFoundError, paymentRequiredError } from '../../errors';
import hotelsRepository from '../../repositories/hotels-repository';
import enrollmentRepository from '../../repositories/enrollment-repository';
import ticketsRepository from '../../repositories/tickets-repository';

async function getHotels(userId: number) {
  await checkUserData(userId);

  const hotels = await hotelsRepository.findHotels();
  if (hotels.length === 0) throw notFoundError();
  return hotels;
}

async function getHotelById(hotelId: number, userId: number) {
  await checkUserData(userId);
  const hotel = await hotelsRepository.findHotelById(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}

async function checkUserData(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findUserTicket(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
}

const hotelsService = {
  getHotels,
  getHotelById,
};

export default hotelsService;
