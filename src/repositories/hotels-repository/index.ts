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

const hotelsRepository = {
  findHotels,
  findHotelById,
};

export default hotelsRepository;
