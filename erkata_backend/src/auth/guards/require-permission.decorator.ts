import { SetMetadata } from '@nestjs/common';
import { Action } from '../permissions';

export const RequirePermission = (...actions: Action[]) =>
  SetMetadata('actions', actions);
