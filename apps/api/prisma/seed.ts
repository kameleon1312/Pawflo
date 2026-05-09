/**
 * Dev seed — creates bot users + dogs for MachDog testing.
 *
 * Run:   pnpm --filter @pawflo/api prisma db seed
 * Remove: pnpm --filter @pawflo/api tsx prisma/seed.ts --clear
 *          or: DELETE FROM "User" WHERE email LIKE 'bot+%@pawflo.dev'
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

// Load .env.local first (Supabase), fallback to .env (local Postgres)
config({ path: '.env.local', override: true });
config();

const prisma = new PrismaClient();

const CLEAR_MODE = process.argv.includes('--clear');

const BOT_PASSWORD = 'DevSeed!2026';

const BOTS: {
  firstName: string;
  lastName: string;
  city: string;
  dog: {
    name: string;
    breed: string;
    sex: 'MALE' | 'FEMALE';
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    activityLevel: 'CALM' | 'MODERATE' | 'ACTIVE';
    traits: string[];
    bio: string;
    birthYear: number;
    photoUrl: string;
  };
}[] = [
  {
    firstName: 'Kasia',
    lastName: 'Kowalska',
    city: 'Warszawa',
    dog: {
      name: 'Burek',
      breed: 'Labrador',
      sex: 'MALE',
      size: 'LARGE',
      activityLevel: 'ACTIVE',
      traits: ['PLAYFUL', 'FRIENDLY', 'ENERGETIC'],
      bio: 'Uwielbia biegać w parku i gonić piłkę. Szuka przyjaciela do wspólnych spacerów!',
      birthYear: 2021,
      photoUrl: 'https://images.dog.ceo/breeds/labrador/n02099712_7473.jpg',
    },
  },
  {
    firstName: 'Marek',
    lastName: 'Wiśniewski',
    city: 'Kraków',
    dog: {
      name: 'Luna',
      breed: 'Border Collie',
      sex: 'FEMALE',
      size: 'MEDIUM',
      activityLevel: 'ACTIVE',
      traits: ['CURIOUS', 'ENERGETIC', 'PLAYFUL'],
      bio: 'Inteligentna i zawsze gotowa do zabawy. Lubi innych psów i długie wycieczki.',
      birthYear: 2022,
      photoUrl: 'https://images.dog.ceo/breeds/collie-border/n02106166_3343.jpg',
    },
  },
  {
    firstName: 'Zofia',
    lastName: 'Nowak',
    city: 'Warszawa',
    dog: {
      name: 'Mochi',
      breed: 'Shiba Inu',
      sex: 'MALE',
      size: 'SMALL',
      activityLevel: 'MODERATE',
      traits: ['CALM', 'CURIOUS', 'INDEPENDENT'],
      bio: 'Niezależny i elegancki. Preferuje spokojne spacery i wybranych przyjaciół.',
      birthYear: 2020,
      photoUrl: 'https://images.dog.ceo/breeds/shiba/shiba-8.jpg',
    },
  },
  {
    firstName: 'Piotr',
    lastName: 'Lewandowski',
    city: 'Gdańsk',
    dog: {
      name: 'Bella',
      breed: 'Golden Retriever',
      sex: 'FEMALE',
      size: 'LARGE',
      activityLevel: 'MODERATE',
      traits: ['GENTLE', 'FRIENDLY', 'CALM'],
      bio: 'Łagodna duszyczka, kocha wszystkich. Idealna do rodziny i do zabawy z innymi psami.',
      birthYear: 2019,
      photoUrl: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
    },
  },
  {
    firstName: 'Ania',
    lastName: 'Jabłońska',
    city: 'Wrocław',
    dog: {
      name: 'Rocky',
      breed: 'Husky',
      sex: 'MALE',
      size: 'LARGE',
      activityLevel: 'ACTIVE',
      traits: ['ENERGETIC', 'PLAYFUL', 'CURIOUS'],
      bio: 'Pełen energii i zawsze gotowy do przygody. Szuka równie aktywnego przyjaciela!',
      birthYear: 2022,
      photoUrl: 'https://images.dog.ceo/breeds/husky/n02110185_10047.jpg',
    },
  },
  {
    firstName: 'Tomek',
    lastName: 'Kowalczyk',
    city: 'Poznań',
    dog: {
      name: 'Zefir',
      breed: 'Beagle',
      sex: 'MALE',
      size: 'SMALL',
      activityLevel: 'MODERATE',
      traits: ['FRIENDLY', 'CURIOUS', 'PLAYFUL'],
      bio: 'Węszy wszędzie i we wszystkim. Towarzyski i łatwy w kontakcie z innymi psami.',
      birthYear: 2021,
      photoUrl: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
    },
  },
  {
    firstName: 'Marta',
    lastName: 'Dąbrowska',
    city: 'Łódź',
    dog: {
      name: 'Nala',
      breed: 'Dalmatyńczyk',
      sex: 'FEMALE',
      size: 'LARGE',
      activityLevel: 'ACTIVE',
      traits: ['ENERGETIC', 'PROTECTIVE', 'FRIENDLY'],
      bio: 'Szybka jak błyskawica i oddana. Uwielbia długie biegi i nowych znajomych.',
      birthYear: 2023,
      photoUrl: 'https://images.dog.ceo/breeds/dalmatian/cooper2.jpg',
    },
  },
  {
    firstName: 'Bartek',
    lastName: 'Mazur',
    city: 'Warszawa',
    dog: {
      name: 'Toffi',
      breed: 'Cocker Spaniel',
      sex: 'FEMALE',
      size: 'SMALL',
      activityLevel: 'CALM',
      traits: ['GENTLE', 'CALM', 'AFFECTIONATE'],
      bio: 'Spokojna i ciepła. Najszczęśliwsza gdy może przytulić się na kanapie lub zrobić krótki spacer.',
      birthYear: 2018,
      photoUrl: 'https://images.dog.ceo/breeds/spaniel-cocker/n02102318_8932.jpg',
    },
  },
];

async function clear() {
  const deleted = await prisma.user.deleteMany({
    where: { email: { startsWith: 'bot+' } },
  });
  console.log(`🗑  Usunięto ${deleted.count} botów.`);
}

async function seed() {
  const passwordHash = await argon2.hash(BOT_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  let created = 0;
  let skipped = 0;

  for (const bot of BOTS) {
    const email = `bot+${bot.dog.name.toLowerCase()}@pawflo.dev`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }

    const birthDate = new Date(`${bot.dog.birthYear}-06-01T00:00:00.000Z`);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: bot.firstName,
        lastName: bot.lastName,
        locationCity: bot.city,
        locationConsent: true,
        emailVerified: true,
        consentTerms: new Date(),
        consentPrivacy: new Date(),
        dogs: {
          create: {
            name: bot.dog.name,
            breed: bot.dog.breed,
            sex: bot.dog.sex,
            size: bot.dog.size,
            activityLevel: bot.dog.activityLevel,
            traits: bot.dog.traits,
            bio: bot.dog.bio,
            birthDate,
            photos: {
              create: [{ url: bot.dog.photoUrl, order: 0 }],
            },
          },
        },
      },
    });

    created++;
    console.log(`🐶 Utworzono bota: ${bot.firstName} + ${bot.dog.name} (${bot.dog.breed}, ${bot.city})`);
  }

  console.log(`\n✅ Gotowe — ${created} botów utworzono, ${skipped} pominięto (już istnieją).`);
  console.log(`\nAby usunąć boty:\n  pnpm --filter @pawflo/api tsx prisma/seed.ts --clear`);
}

async function main() {
  if (CLEAR_MODE) {
    await clear();
  } else {
    await seed();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
