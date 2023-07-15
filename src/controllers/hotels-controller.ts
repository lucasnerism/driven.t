import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares';
import hotelsService from '../services/hotels-service';
import httpStatus from 'http-status';
import { requestError } from '../errors';

async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.getHotels(userId);
  res.status(httpStatus.OK).json(hotels);
}

async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const hotelId = parseInt(req.params.hotelId);
  if (isNaN(hotelId) || hotelId <= 0) throw requestError(httpStatus.BAD_REQUEST, 'Bad Request');
  const { userId } = req;
  const hotel = await hotelsService.getHotelById(hotelId, userId);
  res.status(httpStatus.OK).json(hotel);
}

const hotelsController = {
  getHotels,
  getHotelById,
};

export default hotelsController;
