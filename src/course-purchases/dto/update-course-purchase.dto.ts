import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../utils/enums';

export class UpdateCoursePurchaseDto {
  @ApiPropertyOptional({ description: 'Payment Status', enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Payment Method', enum: PaymentMethod, example: PaymentMethod.UPI })
  @IsEnum(PaymentMethod)
  @IsOptional()
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment Gateway', example: 'Razorpay' })
  @IsString()
  @IsOptional()
  payment_gateway?: string;

  @ApiPropertyOptional({ description: 'Transaction ID', example: 'txn_123456789' })
  @IsString()
  @IsOptional()
  transaction_id?: string;

  @ApiPropertyOptional({ description: 'Coupon Code used', example: 'PROMO10' })
  @IsString()
  @IsOptional()
  coupon_code?: string;
}
