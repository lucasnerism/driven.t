import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createPayment } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotels, createHotelsWithRooms, createRooms } from '../factories/hotels-factory';
import { createBooking } from '../factories/bookings-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have a booking yet', async () => {
      const token = await generateValidToken();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with user booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 1);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = true;
      const includesHotel = false;
      const ticketType = await createTicketType(isRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket type dont includes hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when room doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      await createHotels();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 0);
      await createBooking(user.id, room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 1);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when user doesnt have a booking', async () => {
      const token = await generateValidToken();

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 when room doesnt exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 1);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: 100000 });
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 1);
      const newRoom = await createRooms(hotel.id, 0);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id, 1);
      const newRoom = await createRooms(hotel.id, 1);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
