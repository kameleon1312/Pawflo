import { PrismaClient, PlaceType } from '@prisma/client';

const prisma = new PrismaClient();

const PLACES: Array<{
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
}> = [
  // ─── Warsaw — Vets (12) ──────────────────────────────────────────────────────
  {
    name: 'Klinika Weterynaryjna Animedo',
    type: 'VET',
    address: 'ul. Marszałkowska 45',
    city: 'Warszawa',
    lat: 52.2297, lng: 21.0122,
    phone: '+48221112233',
    website: 'https://animedo.pl',
  },
  {
    name: 'Przychodnia Weterynaryjna Veti',
    type: 'VET',
    address: 'ul. Puławska 100',
    city: 'Warszawa',
    lat: 52.2178, lng: 21.0222,
    phone: '+48224445566',
  },
  {
    name: 'VetHouse Wola',
    type: 'VET',
    address: 'ul. Wolska 32',
    city: 'Warszawa',
    lat: 52.2347, lng: 20.9900,
    phone: '+48227778899',
  },
  {
    name: 'ZooMed Praga',
    type: 'VET',
    address: 'ul. Targowa 15',
    city: 'Warszawa',
    lat: 52.2497, lng: 21.0522,
  },
  {
    name: 'Centrum Weterynaryjne Ursynów',
    type: 'VET',
    address: 'al. KEN 68',
    city: 'Warszawa',
    lat: 52.1480, lng: 21.0420,
    phone: '+48223456789',
  },
  {
    name: 'Klinika PetCare Śródmieście',
    type: 'VET',
    address: 'ul. Nowy Świat 72',
    city: 'Warszawa',
    lat: 52.2320, lng: 21.0180,
  },
  {
    name: 'Centrum Weterynaryjne Żoliborz',
    type: 'VET',
    address: 'ul. Słowackiego 18',
    city: 'Warszawa',
    lat: 52.2730, lng: 20.9920,
    phone: '+48226677889',
  },
  {
    name: 'Klinika Weterynaryjna Białołęka',
    type: 'VET',
    address: 'ul. Głębocka 43',
    city: 'Warszawa',
    lat: 52.3050, lng: 21.0350,
    phone: '+48225544332',
  },
  {
    name: 'Animal Clinic Wilanów',
    type: 'VET',
    address: 'ul. Przyczółkowa 5',
    city: 'Warszawa',
    lat: 52.1600, lng: 21.0820,
    phone: '+48228765432',
    website: 'https://animal-clinic.pl',
  },
  {
    name: 'Gabinet Weterynaryjny Bemowo',
    type: 'VET',
    address: 'ul. Lazurowa 42',
    city: 'Warszawa',
    lat: 52.2450, lng: 20.9250,
    phone: '+48223213456',
  },
  {
    name: 'Centrum Weterynarii Mokotów',
    type: 'VET',
    address: 'ul. Wołoska 9',
    city: 'Warszawa',
    lat: 52.2000, lng: 21.0000,
    phone: '+48225554433',
    website: 'https://wetmokotow.pl',
  },
  {
    name: 'VetPoint Wawer',
    type: 'VET',
    address: 'ul. Trakt Lubelski 210',
    city: 'Warszawa',
    lat: 52.2100, lng: 21.1200,
    phone: '+48228899001',
  },

  // ─── Warsaw — Pet Shops (10) ─────────────────────────────────────────────────
  {
    name: 'Zooland Centrum',
    type: 'SHOP',
    address: 'ul. Złota 59',
    city: 'Warszawa',
    lat: 52.2297, lng: 21.0012,
    phone: '+48221234567',
  },
  {
    name: 'Kakadu Pet Shop',
    type: 'SHOP',
    address: 'ul. Nowy Świat 22',
    city: 'Warszawa',
    lat: 52.2317, lng: 21.0197,
    website: 'https://kakadu.pl',
  },
  {
    name: 'Pets Paradise Mokotów',
    type: 'SHOP',
    address: 'ul. Puławska 55',
    city: 'Warszawa',
    lat: 52.2200, lng: 21.0102,
  },
  {
    name: 'ZooKraina Wilanów',
    type: 'SHOP',
    address: 'ul. Klimczaka 1',
    city: 'Warszawa',
    lat: 52.1657, lng: 21.0497,
    phone: '+48229876543',
  },
  {
    name: 'Pupil Sklep Zoologiczny',
    type: 'SHOP',
    address: 'ul. Grochowska 42',
    city: 'Warszawa',
    lat: 52.2410, lng: 21.0800,
  },
  {
    name: 'ZooPet Żoliborz',
    type: 'SHOP',
    address: 'ul. Broniewskiego 34',
    city: 'Warszawa',
    lat: 52.2700, lng: 20.9850,
    phone: '+48226543210',
  },
  {
    name: 'Pegaz Sklep dla Zwierząt',
    type: 'SHOP',
    address: 'ul. Marywilska 44',
    city: 'Warszawa',
    lat: 52.2950, lng: 21.0100,
    phone: '+48223344556',
  },
  {
    name: 'Max-Zoologiczny Bemowo',
    type: 'SHOP',
    address: 'ul. Powstańców Śl. 2D',
    city: 'Warszawa',
    lat: 52.2470, lng: 20.9300,
  },
  {
    name: 'Aqua Zoo Praga',
    type: 'SHOP',
    address: 'ul. Radzymińska 87',
    city: 'Warszawa',
    lat: 52.2600, lng: 21.0650,
    phone: '+48225566778',
  },
  {
    name: 'Psi Raj Ursynów',
    type: 'SHOP',
    address: 'ul. Rosoła 52',
    city: 'Warszawa',
    lat: 52.1550, lng: 21.0380,
    phone: '+48227788990',
    website: 'https://psi-raj.pl',
  },

  // ─── Warsaw — Groomers (10) ──────────────────────────────────────────────────
  {
    name: 'Dog Spa Mokotów',
    type: 'GROOMER',
    address: 'ul. Wołoska 18',
    city: 'Warszawa',
    lat: 52.2050, lng: 21.0000,
    phone: '+48500100200',
  },
  {
    name: 'Piękny Pies Salon',
    type: 'GROOMER',
    address: 'ul. Hoża 30',
    city: 'Warszawa',
    lat: 52.2260, lng: 21.0150,
  },
  {
    name: 'Groomer & Friends Żoliborz',
    type: 'GROOMER',
    address: 'ul. Mickiewicza 25',
    city: 'Warszawa',
    lat: 52.2660, lng: 20.9780,
    phone: '+48600200300',
  },
  {
    name: 'Psia Elegancja Praga',
    type: 'GROOMER',
    address: 'ul. Kawęczyńska 7',
    city: 'Warszawa',
    lat: 52.2530, lng: 21.0600,
  },
  {
    name: 'Happy Paws Salon Ursynów',
    type: 'GROOMER',
    address: 'ul. Ciszewskiego 14',
    city: 'Warszawa',
    lat: 52.1500, lng: 21.0450,
    phone: '+48501300400',
  },
  {
    name: 'Strzyżalnia Psów Bemowo',
    type: 'GROOMER',
    address: 'ul. Batalionów Chłopskich 59',
    city: 'Warszawa',
    lat: 52.2550, lng: 20.9200,
    phone: '+48502400500',
  },
  {
    name: 'Paw Salon Wilanów',
    type: 'GROOMER',
    address: 'ul. Sarmacka 8',
    city: 'Warszawa',
    lat: 52.1620, lng: 21.0700,
    phone: '+48503500600',
    website: 'https://pawsalon.pl',
  },
  {
    name: 'Top Dog Grooming Białołęka',
    type: 'GROOMER',
    address: 'ul. Nowodworska 35',
    city: 'Warszawa',
    lat: 52.3100, lng: 21.0450,
    phone: '+48504600700',
  },
  {
    name: 'Pet Look Wola',
    type: 'GROOMER',
    address: 'ul. Kasprzaka 18',
    city: 'Warszawa',
    lat: 52.2380, lng: 20.9750,
    phone: '+48505700800',
  },
  {
    name: 'Kudłaty Zakątek Śródmieście',
    type: 'GROOMER',
    address: 'ul. Wilcza 28',
    city: 'Warszawa',
    lat: 52.2250, lng: 21.0100,
    phone: '+48506800900',
  },

  // ─── Kraków — Vets (8) ───────────────────────────────────────────────────────
  {
    name: 'Klinika Weterynaryjna CentrumVet',
    type: 'VET',
    address: 'ul. Floriańska 12',
    city: 'Kraków',
    lat: 50.0641, lng: 19.9445,
    phone: '+48123456789',
    website: 'https://centrumvet.pl',
  },
  {
    name: 'Przychodnia Weterynaryjna Azoty',
    type: 'VET',
    address: 'ul. Szwedzka 10',
    city: 'Kraków',
    lat: 50.0850, lng: 19.9200,
    phone: '+48124567890',
  },
  {
    name: 'Animal Hospital Kraków',
    type: 'VET',
    address: 'ul. Kamieńskiego 36',
    city: 'Kraków',
    lat: 50.0300, lng: 19.9650,
    phone: '+48125678901',
    website: 'https://animalhospital.pl',
  },
  {
    name: 'Gabinet Weterynaryjny Podgórze',
    type: 'VET',
    address: 'ul. Limanowskiego 15',
    city: 'Kraków',
    lat: 50.0478, lng: 19.9586,
    phone: '+48126789012',
  },
  {
    name: 'VetCare Nowa Huta',
    type: 'VET',
    address: 'os. Zgody 4',
    city: 'Kraków',
    lat: 50.0697, lng: 20.0538,
    phone: '+48127890123',
  },
  {
    name: 'Centrum Weterynaryjne Krowodrza',
    type: 'VET',
    address: 'ul. Królewska 66',
    city: 'Kraków',
    lat: 50.0700, lng: 19.9200,
    phone: '+48128901234',
  },
  {
    name: 'Zoo-Med Bronowice',
    type: 'VET',
    address: 'ul. Bronowicka 94',
    city: 'Kraków',
    lat: 50.0780, lng: 19.8950,
    phone: '+48129012345',
  },
  {
    name: 'Klinika Zwierząt Dębniki',
    type: 'VET',
    address: 'ul. Kościuszki 44',
    city: 'Kraków',
    lat: 50.0480, lng: 19.9270,
    phone: '+48120123456',
  },

  // ─── Kraków — Pet Shops (7) ──────────────────────────────────────────────────
  {
    name: 'Zooland Galeria Krakowska',
    type: 'SHOP',
    address: 'ul. Pawia 5',
    city: 'Kraków',
    lat: 50.0677, lng: 19.9460,
    phone: '+48123111222',
  },
  {
    name: 'Zoo Sklep Kazimierz',
    type: 'SHOP',
    address: 'ul. Dietla 68',
    city: 'Kraków',
    lat: 50.0540, lng: 19.9430,
    phone: '+48123222333',
  },
  {
    name: 'Kakadu Kraków Bronowice',
    type: 'SHOP',
    address: 'al. Armii Krajowej 18',
    city: 'Kraków',
    lat: 50.0810, lng: 19.8980,
    phone: '+48123333444',
    website: 'https://kakadu.pl',
  },
  {
    name: 'Psi Świat Prokocim',
    type: 'SHOP',
    address: 'ul. Witosa 8',
    city: 'Kraków',
    lat: 50.0228, lng: 20.0060,
    phone: '+48123444555',
  },
  {
    name: 'Zwierzaki Kraków Podgórze',
    type: 'SHOP',
    address: 'ul. Kalwaryjska 27',
    city: 'Kraków',
    lat: 50.0430, lng: 19.9440,
  },
  {
    name: 'Pet Shop Nowa Huta',
    type: 'SHOP',
    address: 'os. Centrum A 1',
    city: 'Kraków',
    lat: 50.0680, lng: 20.0390,
    phone: '+48123555666',
  },
  {
    name: 'Zoologiczny Raj Krowodrza',
    type: 'SHOP',
    address: 'ul. Reymonta 22',
    city: 'Kraków',
    lat: 50.0730, lng: 19.9110,
    phone: '+48123666777',
  },

  // ─── Kraków — Groomers (7) ───────────────────────────────────────────────────
  {
    name: 'Dog Style Kraków',
    type: 'GROOMER',
    address: 'ul. Grzegórzecka 54',
    city: 'Kraków',
    lat: 50.0600, lng: 19.9600,
    phone: '+48500111222',
  },
  {
    name: 'Salon Pies i Przyjaciele',
    type: 'GROOMER',
    address: 'ul. Starowiślna 4',
    city: 'Kraków',
    lat: 50.0575, lng: 19.9440,
    phone: '+48501222333',
  },
  {
    name: 'Happy Dog Grooming Podgórze',
    type: 'GROOMER',
    address: 'ul. Lwowska 15',
    city: 'Kraków',
    lat: 50.0445, lng: 19.9490,
    phone: '+48502333444',
  },
  {
    name: 'Psia Fryzjernia Bronowice',
    type: 'GROOMER',
    address: 'ul. Malczewskiego 8',
    city: 'Kraków',
    lat: 50.0780, lng: 19.8890,
  },
  {
    name: 'Piękny Kundelek Krowodrza',
    type: 'GROOMER',
    address: 'ul. Lea 12',
    city: 'Kraków',
    lat: 50.0710, lng: 19.9080,
    phone: '+48503444555',
  },
  {
    name: 'Top Paws Nowa Huta',
    type: 'GROOMER',
    address: 'os. Słoneczne 15',
    city: 'Kraków',
    lat: 50.0740, lng: 20.0400,
    phone: '+48504555666',
  },
  {
    name: 'Grooming Studio Kazimierz',
    type: 'GROOMER',
    address: 'ul. Józefa 26',
    city: 'Kraków',
    lat: 50.0525, lng: 19.9430,
    phone: '+48505666777',
    website: 'https://groomingkazimierz.pl',
  },
];

async function main() {
  console.log('Seeding places...');

  // Upsert by name+city to avoid duplicates on re-run
  for (const place of PLACES) {
    await prisma.place.upsert({
      where: { name_city: { name: place.name, city: place.city } },
      update: place,
      create: place,
    });
  }

  console.log(`Done — seeded ${PLACES.length} places.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
