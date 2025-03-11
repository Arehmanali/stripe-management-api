import { UserRole } from '@/modules/auth/dto/auth.dto';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
}
