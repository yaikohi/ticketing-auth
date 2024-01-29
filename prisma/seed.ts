import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

const testUsers = [
  {
    email: "test-user-1@mail.com",
    password: "tu",
  },

  {
    email: "test-user-2@mail.com",
    password: "tu",
  },

  {
    email: "test-user-3@mail.com",
    password: "tu",
  },
];

const seedPrismaUser = async (user: typeof testUsers[number]) => {
  try {
    console.log(`Adding user with email: ${user.email} to db`);
    await prismaClient.user.create({ data: user });
    console.log(`Finished adding user with email ${user.email} to the db!`);
  } catch (err) {
    console.error(`Failed seeding database with user:`);
    console.error({ user });
    console.error(err);
    await prismaClient.$disconnect();
    process.exit(1);
  }
};

async function main() {
  for (const user of testUsers) {
    await seedPrismaUser(user);
  }
}

await main().then(async () => {
  await prismaClient.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prismaClient.$disconnect();
  process.exit(1);
});
