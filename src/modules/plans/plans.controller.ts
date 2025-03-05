import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Plan } from '@/shared/interfaces/plan.interface';
import { JWT_AUTH } from '@/shared/strategies/jwt.strategy';

/**
 * Controller for handling subscription plan-related requests.
 */
@ApiTags('plans')
@Controller('plans')
@ApiBearerAuth(JWT_AUTH)
export class PlansController {
  constructor(private plansService: PlansService) {}

  /**
   * Retrieves all subscription plans.
   * @returns An array of subscription plans.
   */
  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiOkResponse({
    description: 'List of all available subscription plans',
    isArray: true,
    type: [Plan],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access',
  })
  getPlans(): Plan[] {
    return this.plansService.getPlans();
  }
}
