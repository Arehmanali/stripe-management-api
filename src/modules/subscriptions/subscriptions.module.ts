import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PlansModule } from '../plans/plans.module';
import { PaymentRepository } from './repositories/payment.repository';
import { StripeProvider } from '@/shared/providers/stripe.provider';
import { SubscriptionRepository } from './repositories/subscriptions.respository';

@Module({
  imports: [PlansModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionRepository,
    PaymentRepository,
    StripeProvider,
  ],
  exports: [
    SubscriptionsService,
    SubscriptionRepository,
    PaymentRepository,
    StripeProvider,
  ],
})
export class SubscriptionsModule {}
