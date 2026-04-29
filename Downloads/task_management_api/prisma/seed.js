import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Regular User",
      email: "user@example.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  const otherUser = await prisma.user.create({
    data: {
      name: "Other User",
      email: "other@example.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  const project = await prisma.project.create({
    data: {
      title: "Seed Project",
      description: "Project created from seed data",
      userId: user.id,
    },
  });

  const task = await prisma.task.create({
    data: {
      title: "Seed Task",
      description: "Task created from seed data",
      status: "PENDING",
      projectId: project.id,
      dueDate: new Date("2026-05-05"),
    },
  });

  await prisma.comment.create({
    data: {
      content: "Seed comment for testing.",
      userId: user.id,
      taskId: task.id,
    },
  });

  console.log("Seed data created successfully.");
  console.log("Admin:", admin.email, "Password123");
  console.log("User:", user.email, "Password123");
  console.log("Other:", otherUser.email, "Password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });