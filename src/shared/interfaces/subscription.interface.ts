import { ApiProperty } from '@nestjs/swagger';

export class Subscription {
  @ApiProperty({ example: 'sub_123' })
  id: string;

  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ApiProperty({ example: 'basic' })
  planId: string;

  @ApiProperty({ example: 'sub_stripe_123' })
  stripeSubscriptionId: string;

  @ApiProperty({ enum: ['active', 'cancelled', 'expired'] })
  status: 'active' | 'cancelled' | 'expired';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  cancelledAt?: Date;
}
