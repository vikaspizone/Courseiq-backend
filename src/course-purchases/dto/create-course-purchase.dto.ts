import { IsNotEmpty, IsUUID, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../utils/enums';

export class CreateCoursePurchaseDto {
  @ApiProperty({ description: 'Course ID being purchased', example: 'uuid-string' })
  @IsUUID('4')
  @IsNotEmpty()
  course_id!: string;

  @ApiPropertyOptional({ description: 'Student User ID (defaults to req.user.id if not admin)', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  student_id?: string;

  @ApiProperty({ description: 'Actual price at the time of purchase', example: 1999.00 })
  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @ApiPropertyOptional({ description: 'Discount applied', example: 200.00 })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiProperty({ description: 'Final price paid by student', example: 1799.00 })
  @IsNumber()
  @IsNotEmpty()
  final_price!: number;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiPropertyOptional({ description: 'Payment Status', enum: PaymentStatus, example: PaymentStatus.PENDING })
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
