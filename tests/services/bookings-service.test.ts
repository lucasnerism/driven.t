import { cleanDb } from '../helpers';
import { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});
