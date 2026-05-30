import prisma from "@/lib/prisma";

export async function createNotification({ userId, type, title, body, link }) {
  return prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

export async function notifyByRole({ roles, type, title, body, link }) {
  const users = await prisma.user.findMany({
    where: { role: { in: roles }, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type, title, body, link })),
  });
}
