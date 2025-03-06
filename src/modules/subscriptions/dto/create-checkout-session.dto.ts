import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  Refund = 'refund',
}

export enum StripeWebhookEvents {
  CheckoutSessionCompleted = 'checkout.session.completed',
  CustomerSubscriptionDeleted = 'customer.subscription.deleted',
}

export class CreateCheckoutSessionDTO {
  @ApiProperty({
    example: 'basic',
    description: 'The ID of the subscription plan',
    enum: ['basic', 'standard', 'premium'],
  })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({
    example: 'cs_test_...',
    description: 'The ID of the created checkout session',
  })
  sessionId: string;
}
