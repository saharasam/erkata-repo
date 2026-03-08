import { SetMetadata } from '@nestjs/common';
import { Action } from '../permissions';

export const RequirePermission = (action: Action) =>
  SetMetadata('action', action);
