import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing a subscription plan.
 */
export class Plan {
  @ApiProperty({
    description: 'The unique identifier for the plan',
    example: 'basic',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the plan',
    example: 'Basic Plan',
  })
  name: string;

  @ApiProperty({
    description: 'The price of the plan',
    example: 9.99,
  })
  price: number;

  @ApiProperty({
    description: 'The Stripe price ID associated with this plan',
    example: 'price_basic',
  })
  stripePriceId: string;

  @ApiProperty({
    description: 'The features included in this plan',
    example: ['Feature 1', 'Feature 2'],
    type: [String],
  })
  features: string[];
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 100,
    stripePriceId: 'price_1Qzl0MQS67ywEgPXyvadnLlM',
    features: ['Feature 1', 'Feature 2'],
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 200,
    stripePriceId: 'price_1Qzl0dQS67ywEgPXWtnB144D',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 300,
    stripePriceId: 'price_1Qzl14QS67ywEgPXO1pICTcx',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  },
];
