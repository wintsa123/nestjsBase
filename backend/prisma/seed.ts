import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 检查根目录是否存在
  const root = await prisma.directory.findFirst({
    where: { parentId: null }, // 或者根据你的唯一字段改
  });

  if (!root) {
    await prisma.directory.create({
      data: {
        name: '/',
        parentId: null, // 根目录没有上级
      },
    });
    console.log('已创建根目录');
  } else {
    console.log('根目录已存在');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
