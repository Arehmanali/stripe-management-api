import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { expect } from 'chai';
import sinon from 'sinon';
import * as bcrypt from 'bcrypt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@/modules/users/interfaces/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: sinon.stub(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: sinon.stub().returns('test.jwt.token'),
          },
        },
        {
          provide: Logger,
          useValue: {
            debug: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            log: sinon.stub(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const user = {
        id: '123',
        email,
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
      };

      (usersService.findByEmail as sinon.SinonStub).resolves(user);
      sinon.stub(bcrypt, 'compare').resolves(true);

      const result = await service.validateUser(email, password);

      expect(result).to.deep.equal({
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      });
    });

    it('should return null for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = {
        id: '123',
        email,
        password: 'hashedPassword123',
        role: 'user',
        createdAt: new Date(),
      };

      (usersService.findByEmail as sinon.SinonStub).resolves(user);
      sinon.stub(bcrypt, 'compare').resolves(false);

      const result = await service.validateUser(email, password);

      expect(result).to.be(null);
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      (usersService.findByEmail as sinon.SinonStub).resolves(null);

      const result = await service.validateUser(email, password);

      expect(result).to.be(null);
    });
  });

  describe('login', () => {
    it('should generate JWT token for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: '123',
        email,
        role: 'user',
        createdAt: new Date(),
      };

      sinon.stub(service, 'validateUser').resolves(user as User);

      const result = await service.login(email, password);

      expect(result).to.have.property('access_token');
      expect(result.access_token).to.equal('test.jwt.token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      sinon.stub(service, 'validateUser').resolves(null);

      try {
        await service.login(email, password);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.instanceOf(UnauthorizedException);
      }
    });
  });
});
