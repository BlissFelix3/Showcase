import { Module } from '@nestjs/common';
import { MediationsController } from './mediations.controller';
import { MediationsService } from './mediations.service';

@Module({
  controllers: [MediationsController],
  providers: [MediationsService],
})
export class MediationsModule {}
