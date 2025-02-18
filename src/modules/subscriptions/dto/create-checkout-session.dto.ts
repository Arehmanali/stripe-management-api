import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: 'basic',
    description: 'The ID of the subscription plan',
    enum: ['basic', 'standard', 'premium'],
  })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({
    example: 'cs_test_...',
    description: 'The ID of the created checkout session',
  })
  sessionId: string;
}
