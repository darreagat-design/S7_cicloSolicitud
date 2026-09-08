import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, IncidentStatus } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.incident.upsert({
    where: { referenceCode: 'INC-001' },
    update: {},
    create: {
      referenceCode: 'INC-001',
      title: 'Network connectivity issue',
      description: 'Users report intermittent access to the internal network.',
      status: IncidentStatus.OPEN,
    },
  });

  await prisma.incident.upsert({
    where: { referenceCode: 'INC-002' },
    update: {},
    create: {
      referenceCode: 'INC-002',
      title: 'Printer unavailable',
      description: 'The administrative office printer is not responding.',
      status: IncidentStatus.IN_PROGRESS,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
