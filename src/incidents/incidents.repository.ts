import { Injectable } from '@nestjs/common';
import { Prisma, IncidentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.IncidentCreateInput) {
    return this.prisma.incident.create({ data });
  }

  findAll() {
    return this.prisma.incident.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByReferenceCode(referenceCode: string) {
    return this.prisma.incident.findUnique({
      where: { referenceCode },
    });
  }

  isValidStatus(status: string): status is IncidentStatus {
    return Object.values(IncidentStatus).includes(status as IncidentStatus);
  }
}
