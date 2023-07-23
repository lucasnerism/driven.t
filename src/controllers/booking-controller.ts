import { Response } from 'express';
import httpStatus from 'http-status';
import bookingService from '../services/bookings-service';
import { requestError } from '../errors';
import { AuthenticatedRequest } from '@/middlewares';

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId }: { roomId: number } = req.body;
  const booking = await bookingService.postBooking(userId, roomId);
  res.status(httpStatus.OK).json(booking);
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.getBooking(userId);
  res.status(httpStatus.OK).json(booking);
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId }: { roomId: number } = req.body;
  const bookingId = Number(req.params.bookingId);
  if (bookingId <= 0 || isNaN(bookingId)) throw requestError(400, 'Invalid parameter');

  const booking = await bookingService.putBooking(userId, roomId, bookingId);
  res.status(httpStatus.OK).json(booking);
}
