import { expect } from 'chai';
import { PaymentRepository } from '@/modules/subscriptions/repositories/payment.repository';
import sinon from 'sinon';
import * as admin from 'firebase-admin';

const PAYMENT_TEST_NAME = 'payments';
const mockPaymentData = {
  id: 'payment123',
  userId: 'mock-test-user',
  planId: 'mock-price-id',
  status: 'successful',
  stripeSubscriptionId: 'mock-subscription-id',
  createdAt: new Date(),
};

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let firestoreStub: sinon.SinonStubbedInstance<admin.firestore.Firestore>;

  beforeEach(() => {
    firestoreStub = sinon.createStubInstance(admin.firestore.Firestore);
    repository = new PaymentRepository(firestoreStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      firestoreStub.collection.withArgs(PAYMENT_TEST_NAME).returns({
        add: sinon.stub().resolves(mockPaymentData),
      } as any);

      await repository.createPayment(mockPaymentData);
      expect(firestoreStub.collection.calledWith(PAYMENT_TEST_NAME)).to.be.true;
    });

    it('should handle errors when creating payment', async () => {
      firestoreStub.collection.withArgs(PAYMENT_TEST_NAME).returns({
        add: sinon.stub().rejects(new Error('Firestore error')),
      } as any);

      try {
        await repository.createPayment(mockPaymentData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Failed to create payment');
      }
    });
  });
});
