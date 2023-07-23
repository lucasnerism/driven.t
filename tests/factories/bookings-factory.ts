import { prisma } from '@/config';

export function createBooking(userId: number, roomId: number) {
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

export function changeBooking(id: number, roomId: number) {
  return prisma.booking.update({
    data: {
      roomId,
    },
    where: {
      id,
    },
  });
}
