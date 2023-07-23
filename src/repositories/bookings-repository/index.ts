import { prisma } from '@/config';

function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    select: {
      id: true,
    },
  });
}

function changeBooking(id: number, roomId: number) {
  return prisma.booking.update({
    data: {
      roomId,
    },
    where: {
      id,
    },
    select: {
      id: true,
    },
  });
}

const bookingRepository = {
  findBooking,
  createBooking,
  changeBooking,
};

export default bookingRepository;
