import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IncidentsModule } from './incidents/incidents.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    IncidentsModule,
  ],
})
export class AppModule {}
