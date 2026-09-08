import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CategoriesRepository } from '../categories/categories.repository';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsRepository } from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly incidentsRepository: IncidentsRepository,
  ) {}

  async create(createIncidentDto: CreateIncidentDto) {
    const category = await this.categoriesRepository.findByCode(
      createIncidentDto.categoryCode,
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    try {
      return await this.incidentsRepository.create({
        referenceCode: createIncidentDto.referenceCode,
        title: createIncidentDto.title,
        description: createIncidentDto.description,
        status: createIncidentDto.status,
        category: {
          connect: { id: category.id },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Incident referenceCode already exists');
      }

      throw error;
    }
  }

  findAll() {
    return this.incidentsRepository.findAll();
  }
}
