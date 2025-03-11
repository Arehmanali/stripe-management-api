import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  UseGuards,
  Param,
  RawBodyRequest,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { CreateCheckoutSessionDTO } from './dto/create-checkout-session.dto';
import { Request } from 'express';
import { Subscription } from '../../shared/interfaces/subscription.interface';
import { JWT_AUTH } from '@/shared/strategies/jwt.strategy';
import { createLogger } from '@/shared/logger/logger';
import { UserRole } from '../auth/dto/auth.dto';

/**
 * Controller responsible for handling subscription-related operations.
 */
@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth(JWT_AUTH)
export class SubscriptionsController {
  private readonly logger = createLogger(SubscriptionsController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Creates a checkout session for subscribing to a plan.
   *
   * @param {Request & { user: { id: string } }} req - The request object containing user information.
   * @param {CreateCheckoutSessionDTO} body - DTO containing the plan ID for checkout.
   * @returns {Promise<any>} - Returns the checkout session details.
   */
  @Post('checkout')
  @ApiOperation({ summary: 'Create a checkout session for subscription' })
  @ApiBody({ type: CreateCheckoutSessionDTO })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSession(
    @Req() req: Request & { user: { id: string } },
    @Body() body: CreateCheckoutSessionDTO,
  ) {
    this.logger.log(
      `Creating checkout session for user: ${req.user.id} with plan: ${body.planId}`,
    );
    return this.subscriptionsService.createCheckoutSession(
      req.user.id,
      body.planId,
    );
  }

  /**
   * Retrieves the subscription details of the current authenticated user.
   *
   * @param {Request & { user: { id: string } }} req - The request object containing user information.
   * @returns {Promise<Subscription>} - Returns the user's subscription details.
   */
  @Get('user')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({
    status: 200,
    description: 'User subscription details',
    type: Subscription,
  })
  async getUserSubscription(@Req() req: Request & { user: { id: string } }) {
    this.logger.log(`Fetching subscription for user: ${req.user.id}`);
    return this.subscriptionsService.getUserSubscription(req.user.id);
  }

  /**
   * Retrieves all subscriptions (Admin only).
   *
   * @returns {Promise<Subscription[]>} - Returns a list of all subscriptions.
   */
  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all subscriptions',
    type: Subscription,
    isArray: true,
  })
  async getAllSubscriptions() {
    this.logger.log('Fetching all subscriptions (Admin access)');
    return this.subscriptionsService.getAllSubscriptions();
  }

  /**
   * Handles Stripe webhook events.
   *
   * @param {string} signature - The Stripe webhook signature for verification.
   * @param {Buffer} rawBody - The raw request body.
   * @returns {Promise<any>} - Returns the webhook processing result.
   */
  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'Stripe-Signature',
    description: 'Stripe webhook signature',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    this.logger.log('Handling Stripe webhook event');
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error('Raw body is missing in the request');
      throw new Error('Raw body is required for webhook verification');
    }
    return this.subscriptionsService.handleWebhook(signature, rawBody);
  }

  /**
   * Cancels an active subscription.
   *
   * @param {string} subscriptionId - The ID of the subscription to cancel.
   * @returns {Promise<any>} - Returns the cancellation status.
   */
  @Post('cancel/:subscriptionId')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiParam({
    name: 'subscriptionId',
    description: 'The ID of the subscription to cancel',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    this.logger.log(`Canceling subscription with ID: ${subscriptionId}`);
    return this.subscriptionsService.cancelSubscription(subscriptionId);
  }
}
