import { User } from '@/modules/users/interfaces/user.interface';

export const toUserResponse = (user: User): Omit<User, 'password'> => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};
