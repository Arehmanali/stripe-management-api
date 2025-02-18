import { Injectable } from '@nestjs/common';
import {
  Plan,
  SUBSCRIPTION_PLANS,
} from '../../shared/interfaces/plan.interface';

@Injectable()
export class PlansService {
  getPlans(): Plan[] {
    return SUBSCRIPTION_PLANS;
  }

  getPlanById(id: string): Plan | undefined {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
  }
}
