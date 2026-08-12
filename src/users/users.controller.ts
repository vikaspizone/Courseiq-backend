import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { handlePromise } from '../utils/async-handler';
import { PaginationDto } from '../common/dto/pagination.dto';
import { getMulterOptions } from '../config/multer.config';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user with full profile fields' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_image', getMulterOptions('image', 'user')))
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const currentUserId = req.user.id;
    if (file) {
      createUserDto.profile_image = `/uploads/images/user/${file.filename}`;
    }
    const [result, error] = await handlePromise(this.usersService.createUser(createUserDto, currentUserId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const [result, error] = await handlePromise(this.usersService.findAllUsers(paginationDto));
    if (error) throw error;
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the user' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.usersService.findOneUser(id));
    if (error) throw error;
    return result;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the user' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_image', getMulterOptions('image', 'user')))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const currentUserId = req.user.id;
    if (file) {
      updateUserDto.profile_image = `/uploads/images/user/${file.filename}`;
    }
    const [result, error] = await handlePromise(this.usersService.updateUser(id, updateUserDto, currentUserId));
    if (error) throw error;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the user' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [result, error] = await handlePromise(this.usersService.deleteUser(id));
    if (error) throw error;
    return result;
  }
}
