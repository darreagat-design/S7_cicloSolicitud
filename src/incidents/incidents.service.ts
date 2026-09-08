import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentsRepository } from './incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(private readonly incidentsRepository: IncidentsRepository) {}

  async create(createIncidentDto: CreateIncidentDto) {
    try {
      return await this.incidentsRepository.create({
        referenceCode: createIncidentDto.referenceCode,
        title: createIncidentDto.title,
        description: createIncidentDto.description,
        status: createIncidentDto.status,
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
