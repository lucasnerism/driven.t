import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createPayment } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { createHotels, createHotelsWithRooms } from '../factories/hotels-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');
    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user doesnt have a ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = true;
      const includesHotel = false;
      const ticketType = await createTicketType(isRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when ticket type dont includes hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when ticket not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 404 when no hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with all hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const includesHotel = true;
      const ticketType = await createTicketType(undefined, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotelOne = await createHotels();
      const hotelTwo = await createHotels();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            ...hotelOne,
            updatedAt: new Date(hotelOne.updatedAt).toISOString(),
            createdAt: new Date(hotelOne.createdAt).toISOString(),
          },
          {
            ...hotelTwo,
            updatedAt: new Date(hotelTwo.updatedAt).toISOString(),
            createdAt: new Date(hotelTwo.createdAt).toISOString(),
          },
        ]),
      );
    });

    describe('GET /hotels/:hotelId', () => {
      it('should respond with status 404 when given hotel doesnt exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const includesHotel = true;
        const ticketType = await createTicketType(undefined, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        await createPayment(ticket.id, ticketType.price);
        await createHotelsWithRooms();

        const response = await server.get('/hotels/100').set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with hotel informations', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const includesHotel = true;
        const ticketType = await createTicketType(undefined, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotelsWithRooms();
        const body = {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: hotel.Rooms[0].id,
              name: hotel.Rooms[0].name,
              capacity: hotel.Rooms[0].capacity,
              hotelId: hotel.Rooms[0].hotelId,
              createdAt: hotel.Rooms[0].createdAt.toISOString(),
              updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
            },
            {
              id: hotel.Rooms[1].id,
              name: hotel.Rooms[1].name,
              capacity: hotel.Rooms[1].capacity,
              hotelId: hotel.Rooms[1].hotelId,
              createdAt: hotel.Rooms[1].createdAt.toISOString(),
              updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
            },
          ],
        };
        const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(body);
      });
    });
  });
});
