import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import hotelsController from '@/controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', hotelsController.getHotels)
  .get('/:hotelId', hotelsController.getHotelById);

export { hotelsRouter };
