import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRepository } from '../users/repositories/user.repository';
import { LawyerProfileRepository } from '../users/repositories/lawyer-profile.repository';

@ApiTags('geolocation')
@Controller('geolocation')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class GeolocationController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly lawyerRepo: LawyerProfileRepository,
  ) {}

  @Get('lawyers-nearby')
  @Roles('CLIENT')
  @ApiOperation({ summary: 'Find lawyers near a specific location' })
  @ApiQuery({ name: 'lat', description: 'Latitude', example: '6.5244' })
  @ApiQuery({ name: 'lng', description: 'Longitude', example: '3.3792' })
  @ApiQuery({
    name: 'radiusKm',
    description: 'Search radius in kilometers',
    example: '50',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Lawyers found successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid coordinates',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async lawyersNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm = '50',
  ) {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const r = Number(radiusKm);

    // Validate coordinates
    if (isNaN(latNum) || isNaN(lngNum) || isNaN(r)) {
      throw new Error('Invalid coordinates or radius provided');
    }

    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      throw new Error('Coordinates out of valid range');
    }

    const all = await this.lawyerRepo.find();
    const within = all.filter((p) => {
      if (p.latitude == null || p.longitude == null) return false;
      const dLat = ((p.latitude - latNum) * Math.PI) / 180;
      const dLng = ((p.longitude - lngNum) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((latNum * Math.PI) / 180) *
          Math.cos((p.latitude * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371 * c;
      return distance <= r;
    });

    return {
      total: within.length,
      radius: r,
      center: { lat: latNum, lng: lngNum },
      lawyers: within.map((lawyer) => ({
        id: lawyer.id,
        name: lawyer.fullName,
        practiceAreas: lawyer.practiceAreas,
        experience: 'N/A', // yearsOfExperience not in current entity
        rating: lawyer.ratingAverage,
        distance: this.calculateDistance(
          latNum,
          lngNum,
          lawyer.latitude!,
          lawyer.longitude!,
        ),
        location: { lat: lawyer.latitude, lng: lawyer.longitude },
      })),
    };
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c * 100) / 100; // Round to 2 decimal places
  }
}
