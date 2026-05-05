import { AdminRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: number;
  username: string;
  role: AdminRole;
  isActive: boolean;
};
