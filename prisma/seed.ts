import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, IncidentStatus } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const generalCategory = await prisma.category.upsert({
    where: { code: 'GENERAL' },
    update: { name: 'General' },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      code: 'GENERAL',
      name: 'General',
    },
  });

  const hardwareCategory = await prisma.category.upsert({
    where: { code: 'HARDWARE' },
    update: { name: 'Hardware' },
    create: {
      code: 'HARDWARE',
      name: 'Hardware',
    },
  });

  await prisma.category.upsert({
    where: { code: 'SOFTWARE' },
    update: { name: 'Software' },
    create: {
      code: 'SOFTWARE',
      name: 'Software',
    },
  });

  const networkCategory = await prisma.category.upsert({
    where: { code: 'NETWORK' },
    update: { name: 'Network' },
    create: {
      code: 'NETWORK',
      name: 'Network',
    },
  });

  await prisma.incident.upsert({
    where: { referenceCode: 'INC-001' },
    update: {
      category: {
        connect: { id: networkCategory.id },
      },
    },
    create: {
      referenceCode: 'INC-001',
      title: 'Network connectivity issue',
      description: 'Users report intermittent access to the internal network.',
      status: IncidentStatus.OPEN,
      category: {
        connect: { id: networkCategory.id },
      },
    },
  });

  await prisma.incident.upsert({
    where: { referenceCode: 'INC-002' },
    update: {
      category: {
        connect: { id: hardwareCategory.id },
      },
    },
    create: {
      referenceCode: 'INC-002',
      title: 'Printer unavailable',
      description: 'The administrative office printer is not responding.',
      status: IncidentStatus.IN_PROGRESS,
      category: {
        connect: { id: hardwareCategory.id },
      },
    },
  });

  await prisma.incident.upsert({
    where: { referenceCode: 'INC-003' },
    update: {
      category: {
        connect: { id: generalCategory.id },
      },
    },
    create: {
      referenceCode: 'INC-003',
      title: 'Email service unavailable',
      description: 'Users cannot access their email accounts.',
      status: IncidentStatus.OPEN,
      category: {
        connect: { id: generalCategory.id },
      },
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
