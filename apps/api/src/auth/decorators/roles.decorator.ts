import { SetMetadata } from '@nestjs/common';

export type AppRole =
  'SUPER_ADMIN' | 'DOCTOR_ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
