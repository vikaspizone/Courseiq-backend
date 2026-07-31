import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { handlePromise } from '../utils/async-handler';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user with full profile fields' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const currentUserId = req.user.id;
    const [result, error] = await handlePromise(this.usersService.createUser(createUserDto, currentUserId));
    if (error) throw error;
    return result;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    const [result, error] = await handlePromise(this.usersService.findAllUsers());
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
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const currentUserId = req.user.id;
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
