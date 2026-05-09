import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Haversine formula — returns distance in kilometres
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const querySchema = z.object({
  lat:    z.coerce.number().min(-90).max(90),
  lng:    z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(10),
  type:   z.enum(['VET', 'SHOP', 'GROOMER']).optional(),
});

export async function placeRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Nieprawidłowe parametry zapytania.' });
    }

    const { lat, lng, radius, type } = parsed.data;

    const rows = await app.prisma.place.findMany({
      where: type ? { type } : undefined,
      select: {
        id: true, name: true, type: true,
        address: true, city: true,
        lat: true, lng: true,
        phone: true, website: true,
      },
    });

    const places = rows
      .map((p) => ({ ...p, distanceKm: haversineKm(lat, lng, p.lat, p.lng) }))
      .filter((p) => p.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return reply.send({ places });
  });
}
