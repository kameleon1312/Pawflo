/**
 * Dev helper — deletes all swipes made BY your dog so the deck resets.
 * Run: npx tsx prisma/reset-swipes.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local', override: true });
config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const myDogs = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT d.id, d.name FROM "Dog" d
    JOIN "User" u ON u.id = d."ownerId"
    WHERE u.email NOT LIKE 'bot+%' LIMIT 1
  `;

  if (!myDogs[0]) {
    console.error('Nie znaleziono Twojego psa.');
    return;
  }

  const myDog = myDogs[0];
  const result = await prisma.$executeRaw`
    DELETE FROM "Swipe" WHERE "swiperId" = ${myDog.id}
  `;

  console.log(`✅ Usunięto ${result} swipe'ów ${myDog.name}. Odśwież MachDog w aplikacji.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
