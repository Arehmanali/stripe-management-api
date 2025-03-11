import * as bcrypt from 'bcrypt';

export const bcryptUtil = {
  compare: (plain: string, hashed: string) => bcrypt.compare(plain, hashed),
  hash: (plain: string, salt: number) => bcrypt.hash(plain, salt),
};
