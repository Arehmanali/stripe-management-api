import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

/**
 * Interface representing a subscription.
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'expired';
  createdAt: Date;
  cancelledAt?: Date;
}

/**
 * Interface representing a subscription plan.
 */
export interface Plan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string;
  features: string[];
}

/**
 * List of available subscription plans.
 */
export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    stripePriceId: 'price_basic',
    features: ['Feature 1', 'Feature 2'],
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 19.99,
    stripePriceId: 'price_standard',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 29.99,
    stripePriceId: 'price_premium',
    features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
  },
];

/**
 * Controller for handling subscription plan-related requests.
 */
@ApiTags('plans')
@Controller('plans')
@ApiBearerAuth('JWT-auth')
export class PlansController {
  constructor(private plansService: PlansService) {}

  /**
   * Retrieves all subscription plans.
   * @returns An array of subscription plans.
   */
  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'List of all available subscription plans',
    isArray: true,
  })
  getPlans(): Plan[] {
    return this.plansService.getPlans();
  }
}
