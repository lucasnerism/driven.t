import ticketsRepository from '../../repositories/tickets-repository';
import { forbiddenActionError } from '../../errors/forbidden-action-error';
import hotelsRepository from '../../repositories/hotels-repository';
import bookingRepository from '../../repositories/bookings-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError } from '@/errors';

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findUserTicket(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenActionError();
  }

  await checkRoomAvailability(roomId);

  const booking = await bookingRepository.createBooking(userId, roomId);
  return { bookingId: booking.id };
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  const booking = await bookingRepository.findBooking(userId);
  if (!booking || booking.id !== bookingId) throw forbiddenActionError();
  await checkRoomAvailability(roomId);

  const newBooking = await bookingRepository.changeBooking(bookingId, roomId);
  return { bookingId: newBooking.id };
}

async function checkRoomAvailability(roomId: number) {
  const room = await hotelsRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  if (room.Booking.length >= room.capacity) throw forbiddenActionError();
}

const bookingService = {
  postBooking,
  getBooking,
  putBooking,
};

export default bookingService;
