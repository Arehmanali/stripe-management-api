import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from '../../src/modules/subscriptions/subscriptions.service';
import { PlansService } from '../../src/modules/plans/plans.service';
import { PaymentRepository } from '../../src/modules/subscriptions/repositories/payment.repository';
import { SubscriptionRepository } from '@/modules/subscriptions/repositories/subscriptions.respository';
import { expect } from 'chai';
import sinon from 'sinon';
import Stripe from 'stripe';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let plansService: PlansService;
  let paymentRepository: PaymentRepository;
  let subscriptionRepository: SubscriptionRepository;
  let stripeStub: sinon.SinonStubbedInstance<Stripe>;

  beforeEach(async () => {
    stripeStub = {
      checkout: {
        sessions: {
          create: sinon.stub().resolves({ id: 'sess_123' }),
        },
      },
      webhooks: {
        constructEvent: sinon.stub(),
      },
      subscriptions: {
        cancel: sinon.stub(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PlansService,
          useValue: {
            getPlanById: sinon.stub(),
          },
        },
        {
          provide: PaymentRepository,
          useValue: {
            createPayment: sinon.stub(),
            updatePaymentStatus: sinon.stub(),
          },
        },
        {
          provide: SubscriptionRepository,
          useValue: {
            createPayment: sinon.stub(),
            updatePaymentStatus: sinon.stub(),
          },
        },
        {
          provide: Stripe,
          useValue: stripeStub,
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    plansService = module.get<PlansService>(PlansService);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    subscriptionRepository = module.get<SubscriptionRepository>(
      SubscriptionRepository,
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const userId = 'user123';
      const planId = 'basic';
      const plan = {
        id: 'basic',
        name: 'Basic Plan',
        price: 9.99,
        stripePriceId: 'price_basic',
        features: ['Feature 1'],
      };

      (plansService.getPlanById as sinon.SinonStub).resolves(plan);

      const result = await service.createCheckoutSession(userId, planId);

      expect(result).to.deep.equal({ sessionId: 'sess_123' });
    });

    it('should throw NotFoundException for invalid plan', async () => {
      const userId = 'user123';
      const planId = 'invalid';

      (plansService.getPlanById as sinon.SinonStub).resolves(undefined);

      try {
        await service.createCheckoutSession(userId, planId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Plan not found');
      }
    });
  });
});
