/**
 * Dev helper — makes all bots swipe LIKE on your dog.
 * After running this, swipe RIGHT on any bot in the app to create a match.
 *
 * Run: npx tsx prisma/bot-like-me.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local', override: true });
config();

import { PrismaClient } from '@prisma/client';

const dbUrl = process.env['DATABASE_URL'];
console.log('Using DB:', dbUrl ? dbUrl.replace(/:([^:@]+)@/, ':***@') : 'UNDEFINED');

const prisma = new PrismaClient();

async function main() {
  // Count all dogs to verify connection
  const total = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Dog"`;
  console.log('Total dogs in DB:', Number(total[0]?.count));

  // Find your dog — any dog whose owner is not a bot
  const myDogs = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT d.id, d.name
    FROM "Dog" d
    JOIN "User" u ON u.id = d."ownerId"
    WHERE u.email NOT LIKE 'bot+%'
    LIMIT 5
  `;
  console.log('Your dogs:', myDogs);

  if (myDogs.length === 0) {
    console.error('Brak psa. Przejdź przez onboarding w aplikacji i spróbuj ponownie.');
    return;
  }

  const myDog = myDogs[0]!;
  console.log(`Twój pies: ${myDog.name} (${myDog.id})`);

  // Find all bot dogs
  const bots = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT d.id, d.name
    FROM "Dog" d
    JOIN "User" u ON u.id = d."ownerId"
    WHERE u.email LIKE 'bot+%'
  `;
  console.log(`Botów: ${bots.length}`);

  let created = 0;
  for (const bot of bots) {
    await prisma.$executeRaw`
      INSERT INTO "Swipe" (id, "swiperId", "swipeeId", direction, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${bot.id},
        ${myDog.id},
        'LIKE'::"SwipeDirection",
        NOW()
      )
      ON CONFLICT ("swiperId", "swipeeId") DO UPDATE SET direction = 'LIKE'
    `;
    created++;
    console.log(`  ✓ ${bot.name} polubił ${myDog.name}`);
  }

  console.log(`\n✅ ${created} botów polubiło Twojego psa.`);
  console.log("Teraz w aplikacji swipe'uj w prawo na dowolnego bota → match → czat.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
