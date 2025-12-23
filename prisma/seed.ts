import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear tienda base
  const store = await prisma.store.create({
    data: {
      name: 'Mi Tienda Online',
      description: 'Sistema de administración de e-commerce genérico',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#ffffff',
        text: '#1f2937',
      },
      currency: 'USD',
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
    },
  });

  console.log('✅ Tienda creada:', store.name);

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tienda.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      storeId: store.id,
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);
  console.log('\n📋 CREDENCIALES DE ACCESO:');
  console.log('   Email: admin@tienda.com');
  console.log('   Password: admin123');
  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
