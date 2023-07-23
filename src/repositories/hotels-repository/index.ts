import { prisma } from '@/config';

function findHotels() {
  return prisma.hotel.findMany();
}

function findHotelById(id: number) {
  return prisma.hotel.findFirst({
    where: {
      id,
    },
    include: {
      Rooms: true,
    },
  });
}

function findRoomById(id: number) {
  return prisma.room.findFirst({
    where: {
      id,
    },
    include: {
      Booking: true,
    },
  });
}

const hotelsRepository = {
  findHotels,
  findHotelById,
  findRoomById,
};

export default hotelsRepository;
