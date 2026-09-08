import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  findByCode(code: string) {
    return this.prisma.category.findUnique({
      where: { code },
    });
  }
}
