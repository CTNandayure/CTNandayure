import { PrismaClient } from '../generated/prisma/client';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  // Hashear contraseña
  const passwordHash = await argon2.hash('AdminPassword123!');

  // Verificar si el usuario ya existe (para no duplicados)
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@test.com' },
  });

  if (!existingUser) {
    // Crear persona
    const person = await prisma.person.create({
      data: {
        name: 'Admin',
        first_lastname: 'Test',
        second_lastname: 'Admin',
        phone: '+525512345678',
      },
    });

    // Crear usuario admin
    await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVO',
        personId: person.id_person,
      },
    });

    console.log('Usuario Admin creado en la base de datos');
  } else {
    console.log('Usuario Admin ya existe, saltando creación');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error en seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });