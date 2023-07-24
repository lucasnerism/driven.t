import faker from '@faker-js/faker';
import { Room } from '@prisma/client';
import { cleanDb } from '../helpers';
import { init } from '@/app';
import bookingRepository from '@/repositories/bookings-repository';
import bookingService from '@/services/bookings-service';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { forbiddenActionError } from '@/errors/forbidden-action-error';
import { notFoundError } from '@/errors';
import * as helper from '@/services/bookings-service';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('getBooking', () => {
  it('should return not found error when booking doesnt exist', async () => {
    jest.spyOn(bookingRepository, 'findBooking').mockResolvedValue(null);
    const promise = bookingService.getBooking(1);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return the booking', async () => {
    const booking: { id: number; Room: Room } = {
      id: 1,
      Room: {
        id: 1,
        name: faker.animal.bird(),
        capacity: 2,
        hotelId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    jest.spyOn(bookingRepository, 'findBooking').mockResolvedValue(booking);

    const result = await bookingService.getBooking(1);
    expect(result).toEqual(booking);
  });
});

describe('postBooking', () => {
  const mockEnrollment = {
    id: 1,
    name: faker.name.findName(),
    cpf: '12345678910',
    birthday: new Date(),
    phone: '123456789',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    Address: [
      {
        id: 1,
        cep: '68397-4212',
        street: "O'Connell Oval",
        city: 'Maxinefurt',
        state: 'São Paulo',
        number: '95343',
        neighborhood: 'Fort Lillie',
        addressDetail: 'none',
        enrollmentId: 1,
        createdAt: new Date('2023-07-23T23:17:11.487'),
        updatedAt: new Date('2023-07-23T23:17:11.487'),
      },
    ],
  };

  const mockTicketRemote = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.company.companyName(),
      price: 12345,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRemote: true,
      includesHotel: true,
    },
  };

  const mockTicketNoHotel = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.company.companyName(),
      price: 12345,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRemote: false,
      includesHotel: false,
    },
  };

  const mockTicket = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.company.companyName(),
      price: 12345,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRemote: false,
      includesHotel: true,
    },
  };

  it('should return not found error if no enrollment', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(null);
    const promise = bookingService.postBooking(1, 1);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return not found error if no ticket', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, 'findUserTicket').mockResolvedValue(null);

    const promise = bookingService.postBooking(1, 1);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return forbidden error if ticket is remote', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, 'findUserTicket').mockResolvedValue({ ...mockTicketRemote, status: 'PAID' });

    const promise = bookingService.postBooking(1, 1);
    expect(promise).rejects.toEqual(forbiddenActionError());
  });

  it('should return forbidden error if ticket doesnt includes hotel', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, 'findUserTicket').mockResolvedValue({ ...mockTicketNoHotel, status: 'PAID' });

    const promise = bookingService.postBooking(1, 1);
    expect(promise).rejects.toEqual(forbiddenActionError());
  });

  it('should return forbidden error if ticket not paid', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, 'findUserTicket').mockResolvedValue({ ...mockTicket, status: 'RESERVED' });

    const promise = bookingService.postBooking(1, 1);
    expect(promise).rejects.toEqual(forbiddenActionError());
  });

  it('should return bookingId', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, 'findUserTicket').mockResolvedValue({ ...mockTicket, status: 'PAID' });
    jest.spyOn(helper, 'checkRoomAvailability').mockResolvedValue(null);
    jest.spyOn(bookingRepository, 'createBooking').mockResolvedValue({ id: 1 });

    const result = await bookingService.postBooking(1, 1);
    expect(result).toEqual({ bookingId: 1 });
  });
});

describe('putBooking', () => {
  it('should return forbidden error if user doesnt have booking', async () => {
    jest.spyOn(bookingRepository, 'findBooking').mockResolvedValue(null);
    const promise = bookingService.putBooking(1, 1, 1);
    expect(promise).rejects.toEqual(forbiddenActionError());
  });

  it('should return new bookingId', async () => {
    const mockBooking: { id: number; Room: Room } = {
      id: 1,
      Room: {
        id: 1,
        name: faker.animal.bird(),
        capacity: 2,
        hotelId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    jest.spyOn(bookingRepository, 'findBooking').mockResolvedValue(mockBooking);
    jest.spyOn(helper, 'checkRoomAvailability').mockResolvedValue(null);
    jest.spyOn(bookingRepository, 'changeBooking').mockResolvedValue({ id: 2 });

    const result = await bookingService.putBooking(1, 1, 1);
    expect(result).toEqual({ bookingId: 2 });
  });
});
