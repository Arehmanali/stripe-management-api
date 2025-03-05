import * as bcrypt from 'bcrypt';

export const hashUtil = {
  compare: (plain: string, hashed: string) => bcrypt.compare(plain, hashed),
};
