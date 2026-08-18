import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CoursePurchasesService } from './course-purchases.service';
import { CreateCoursePurchaseDto } from './dto/create-course-purchase.dto';
import { UpdateCoursePurchaseDto } from './dto/update-course-purchase.dto';
import { CoursePurchaseFilterDto } from './dto/course-purchase-filter.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { handlePromise } from '../utils/async-handler';
import { trans } from '../utils/trans';

@ApiTags('Course Purchases')
@ApiBearerAuth('JWT-auth')
@UseGuards(PermissionsGuard)
@Controller('course-purchases')
export class CoursePurchasesController {
  constructor(private readonly purchasesService: CoursePurchasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a course purchase transaction' })
  async create(@Body() createDto: CreateCoursePurchaseDto, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role?.name || '';
    const [result, error] = await handlePromise(
      this.purchasesService.create(createDto, userId, userRole)
    );
    if (error) throw error;
    return {
      message: trans('purchase.created'),
      data: result,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all course purchases with pagination and filters' })
  async findAll(@Query() filterDto: CoursePurchaseFilterDto) {
    const [result, error] = await handlePromise(this.purchasesService.findAll(filterDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get purchase transaction details by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the purchase record' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.purchasesService.findOne(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update purchase details (e.g. payment status/method)' })
  @ApiParam({ name: 'id', description: 'UUID of the purchase record' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateCoursePurchaseDto,
  ) {
    const [result, error] = await handlePromise(this.purchasesService.update(id, updateDto));
    if (error) throw error;
    return {
      message: trans('purchase.updated'),
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course purchase record' })
  @ApiParam({ name: 'id', description: 'UUID of the purchase record' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.purchasesService.remove(id));
    if (error) throw error;
    return result;
  }
}
