import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotelsWithRooms() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.animal.bird(),
              capacity: faker.datatype.number({ min: 1, max: 3 }),
            },
            {
              name: faker.animal.bird(),
              capacity: faker.datatype.number({ min: 1, max: 3 }),
            },
          ],
        },
      },
    },
    include: { Rooms: true },
  });
}

export async function createHotels() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.image.business(),
      Rooms: {
        createMany: {
          data: [
            {
              name: faker.animal.bird(),
              capacity: faker.datatype.number({ min: 1, max: 3 }),
            },
            {
              name: faker.animal.bird(),
              capacity: faker.datatype.number({ min: 1, max: 3 }),
            },
          ],
        },
      },
    },
  });
}
