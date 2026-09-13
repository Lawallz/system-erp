import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // 1. Criar Permissões Padrão
  const permissionsList = [
  'products:create',
  'products:read',
  'products:update',
  'products:delete',

  'sales:create',
  'sales:read',
  'sales:cancel',

  'stock:read',
  'stock:create',

  'reports:read',

  'users:create',
  'users:read',
  'users:update',
  'users:delete',

  'suppliers:create',
  'suppliers:read',
  'suppliers:update'
];

  const createdPermissions = [];
  for (const permName of permissionsList) {
    const permission = await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName, description: `Permissão para ${permName}` },
    });
    createdPermissions.push(permission);
  }

  // 2. Criar Role Admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrador geral do sistema',
    },
  });

  // 3. Vincular todas as permissões ao Admin
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 4. Criar Usuário Admin padrão
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@minierp.com',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('Seed executado com sucesso! Usuário padrão: admin@minierp.com / Senha: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });