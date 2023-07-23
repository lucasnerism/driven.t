import { ApplicationError } from '@/protocols';

export function forbiddenActionError(): ApplicationError {
  return {
    name: 'ForbiddenActionError',
    message: 'You cant perform this action',
  };
}
