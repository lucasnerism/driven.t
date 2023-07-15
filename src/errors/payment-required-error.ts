import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message: 'Your ticket does not include hotel or you havent paid yet!',
  };
}
