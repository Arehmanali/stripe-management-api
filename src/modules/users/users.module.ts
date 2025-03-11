import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/users.repository';
import { FirebaseModule } from '@/shared/providers/firebase.provider';

@Module({
  providers: [UsersService, UserRepository, FirebaseModule],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
