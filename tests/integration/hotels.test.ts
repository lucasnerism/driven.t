import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createPayment } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import { createHotels } from '../factories/hotels-factory';

beforeAll(async () => {
  await init();
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
      const isRemote = false;
      const includesHotel = false;
      const ticketType = await createTicketType(isRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when ticket not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 404 when no hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with all hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createPayment(ticket.id, ticketType.price);
      const hotelOne = await createHotels();
      const hotelTwo = await createHotels();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining(hotelOne), expect.objectContaining(hotelTwo)]),
      );
    });

    describe('GET /hotels/:hotelId', () => {
      it('should respond with status 404 when given hotel doesnt exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        await createPayment(ticket.id, ticketType.price);
        await createHotels();

        const response = await server.get('/hotels/hotelId').set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.NOT_FOUND);

        const responseTwo = await server.get('/hotels/100').set('Authorization', `Bearer ${token}`);
        expect(responseTwo.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with hotel informations', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotels();

        const response = await server.get('/hotels/hotelId').set('Authorization', `Bearer ${token}`);
        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toEqual(hotel);
      });
    });
  });
});
