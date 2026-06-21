import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ew-production.ru";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  // Create admin user
  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      emailVerified: true,
      role: "admin",
    },
  });

  console.log(`Admin user created: ${adminEmail}`);

  // Create initial course
  await prisma.course.upsert({
    where: { slug: "vue" },
    update: {},
    create: {
      slug: "vue",
      title: "Vue 3. Разработка клиентских приложений",
      description: "Полный курс по Vue 3: от основ до продвинутых тем. Composition API, Pinia, маршрутизация, тестирование и анимации.",
      price: 2499,
      freeModules: 1,
      isPublished: true,
    },
  });

  console.log("Course 'vue' created");

  // Нейровидео с нуля — мини-курс, slug совпадает с папкой content/courses/neurovideo
  await prisma.course.upsert({
    where: { slug: "neurovideo" },
    update: { price: 299, freeModules: 1, isPublished: true },
    create: {
      slug: "neurovideo",
      title: "Нейровидео с нуля",
      description:
        "Практический мини-курс: как делать видео с помощью нейросетей и зарабатывать на этом. От первого ролика на телефоне до первых клиентов — простым языком, без технического жаргона.",
      price: 299,
      freeModules: 1,
      isPublished: true,
    },
  });

  console.log("Course 'neurovideo' created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
