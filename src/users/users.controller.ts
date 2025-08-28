import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return await this.usersService.getUserWithProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() profileData: any) {
    return await this.usersService.updateUserProfile(req.user.sub, profileData);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findByIdOrFail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deactivate')
  async deactivateUser(@Request() req: any) {
    await this.usersService.deactivateUser(req.user.sub);
    return { message: 'User deactivated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reactivate')
  async reactivateUser(@Request() req: any) {
    await this.usersService.reactivateUser(req.user.sub);
    return { message: 'User reactivated successfully' };
  }
}
