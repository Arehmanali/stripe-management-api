import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlansModule } from '../plans/plans.module';
import { PaymentRepository } from './payment.repository';

@Module({
  imports: [PlansModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PaymentRepository],
  exports: [SubscriptionsService, PaymentRepository],
})
export class SubscriptionsModule {}
