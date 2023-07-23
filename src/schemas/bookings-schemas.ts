import Joi from 'joi';

export const bookingSchema = Joi.object<bookingsBody>({
  roomId: Joi.number().positive().required(),
});

type bookingsBody = {
  roomId: number;
};
