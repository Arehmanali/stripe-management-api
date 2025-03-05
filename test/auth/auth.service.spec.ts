import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';
import { hashUtil } from '@/utils/hash.util';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: sinon.SinonStubbedInstance<UsersService>;
  let jwtService: sinon.SinonStubbedInstance<JwtService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
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
            sign: sinon.stub(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get(
      UsersService,
    ) as sinon.SinonStubbedInstance<UsersService>;
    jwtService = moduleRef.get(
      JwtService,
    ) as sinon.SinonStubbedInstance<JwtService>;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should validate user with correct credentials', async () => {
    const now = new Date();
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      createdAt: now,
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(hashUtil, 'compare').resolves(true);

    const result = await authService.validateUser(
      'test@example.com',
      'password',
    );

    expect(result).to.deep.equal({
      id: '123',
      email: 'test@example.com',
      role: 'user',
      createdAt: now,
    });
    expect(usersService.findByEmail.calledOnceWith('test@example.com')).to.be
      .true;
  });

  it('should return null if user is not found', async () => {
    usersService.findByEmail.resolves(null);

    const result = await authService.validateUser(
      'notfound@example.com',
      'password',
    );

    expect(result).to.be.null;
  });

  it('should return null if password does not match', async () => {
    const now = new Date();
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      createdAt: now,
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(hashUtil, 'compare').resolves(false);

    const result = await authService.validateUser(
      'test@example.com',
      'wrongpassword',
    );

    expect(result).to.be.null;
  });

  it('should throw UnauthorizedException if login fails', async () => {
    usersService.findByEmail.resolves(null);

    try {
      await authService.login('invalid@example.com', 'wrongpassword');
      expect.fail('Expected UnauthorizedException');
    } catch (error) {
      expect(error).to.be.instanceOf(UnauthorizedException);
      expect(error.message).to.equal('Invalid credentials');
    }
  });

  it('should return access token if login is successful', async () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      createdAt: new Date(),
    };

    usersService.findByEmail.resolves(user);
    sinon.stub(hashUtil, 'compare').resolves(true);
    jwtService.sign.returns('mocked-jwt-token');

    const result = await authService.login('test@example.com', 'password');

    expect(result).to.deep.equal({ access_token: 'mocked-jwt-token' });
    expect(jwtService.sign.calledOnce).to.be.true;
  });
});
