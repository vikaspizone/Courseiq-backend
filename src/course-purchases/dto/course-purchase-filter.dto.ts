import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaymentStatus } from '../../utils/enums';

export class CoursePurchaseFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Course ID', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  course_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Student User ID', example: 'uuid-string' })
  @IsUUID('4')
  @IsOptional()
  student_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Payment Status', enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;
}
