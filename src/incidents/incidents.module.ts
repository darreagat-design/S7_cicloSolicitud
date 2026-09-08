import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsRepository } from './incidents.repository';
import { IncidentsService } from './incidents.service';

@Module({
  imports: [CategoriesModule],
  controllers: [IncidentsController],
  providers: [IncidentsRepository, IncidentsService],
})
export class IncidentsModule {}
