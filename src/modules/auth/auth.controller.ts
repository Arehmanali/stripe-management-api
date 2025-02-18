import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDto, LoginResponseDto } from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiProperty,
} from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { Public } from '@/shared/decorators/public.decorator';

/**
 * Data Transfer Object for creating a checkout session.
 */
export class CreateCheckoutSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  planId: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async signup(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<LoginResponseDto> {
    await this.usersService.createUser(credentials.email, credentials.password);
    return this.authService.login(credentials.email, credentials.password);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: AuthCredentialsDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(credentials.email, credentials.password);
  }
}
