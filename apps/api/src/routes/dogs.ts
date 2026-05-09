import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateDogSchema, UpdateDogSchema } from '@pawflo/validation';
import { encrypt, decrypt } from '@pawflo/utils';
import { requireAuth } from '../middleware/requireAuth';
import { logger } from '../lib/logger';

type DogRow = {
  chipNumberEncrypted: string | null;
  [key: string]: unknown;
};

function formatDog<T extends DogRow>(dog: T): Omit<T, 'chipNumberEncrypted'> & { chipNumber: string | null } {
  const { chipNumberEncrypted, ...rest } = dog;
  return { ...rest, chipNumber: chipNumberEncrypted ? decrypt(chipNumberEncrypted) : null };
}

const PhotoBody = z.object({
  url: z
    .string()
    .url()
    .max(2048)
    .refine((u) => u.startsWith('https://'), { message: 'Photo URL must use HTTPS' }),
  order: z.number().int().min(0).max(100).default(0),
});

export async function dogRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/dogs — all dogs owned by current user
  app.get('/', async (req, reply) => {
    const dogs = await app.prisma.dog.findMany({
      where: { ownerId: req.userId!, deletedAt: null },
      include: { photos: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    return reply.send({ dogs: dogs.map(formatDog) });
  });

  // POST /api/dogs — create dog
  app.post('/', async (req, reply) => {
    const parsed = CreateDogSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { birthDate, chipNumber, ...rest } = parsed.data;
    const dog = await app.prisma.dog.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        ownerId: req.userId!,
        chipNumberEncrypted: chipNumber ? encrypt(chipNumber) : null,
      },
      include: { photos: true },
    });

    logger.info({ event: 'dog.create', dogId: dog.id, userId: req.userId }, 'Dog created');
    return reply.status(201).send({ dog: formatDog(dog) });
  });

  // GET /api/dogs/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await app.prisma.dog.findFirst({
      where: { id, ownerId: req.userId!, deletedAt: null },
      include: { photos: { orderBy: { order: 'asc' } } },
    });
    if (!dog) return reply.status(404).send({ error: 'Pies nie znaleziony.' });
    return reply.send({ dog: formatDog(dog) });
  });

  // PATCH /api/dogs/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = UpdateDogSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const existing = await app.prisma.dog.findFirst({
      where: { id, ownerId: req.userId!, deletedAt: null },
    });
    if (!existing) return reply.status(404).send({ error: 'Pies nie znaleziony.' });

    const { birthDate, chipNumber, ...rest } = parsed.data;
    const dog = await app.prisma.dog.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
        ...(chipNumber !== undefined ? { chipNumberEncrypted: chipNumber ? encrypt(chipNumber) : null } : {}),
      },
      include: { photos: { orderBy: { order: 'asc' } } },
    });
    return reply.send({ dog: formatDog(dog) });
  });

  // DELETE /api/dogs/:id — soft delete
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await app.prisma.dog.findFirst({
      where: { id, ownerId: req.userId!, deletedAt: null },
    });
    if (!existing) return reply.status(404).send({ error: 'Pies nie znaleziony.' });

    await app.prisma.dog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info({ event: 'dog.delete', dogId: id, userId: req.userId }, 'Dog soft-deleted');
    return reply.status(204).send();
  });

  // POST /api/dogs/:id/photos — store a photo URL (S3/R2 upload handled client-side in production)
  app.post('/:id/photos', async (req, reply) => {
    const { id } = req.params as { id: string };

    const parsed = PhotoBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowy URL zdjęcia.', details: parsed.error.flatten() });
    }

    const { url, order } = parsed.data;

    const existing = await app.prisma.dog.findFirst({
      where: { id, ownerId: req.userId!, deletedAt: null },
    });
    if (!existing) return reply.status(404).send({ error: 'Pies nie znaleziony.' });

    const photo = await app.prisma.photo.create({
      data: { dogId: id, url, order },
    });
    return reply.status(201).send({ photo });
  });

  // DELETE /api/dogs/:id/photos/:photoId
  app.delete('/:id/photos/:photoId', async (req, reply) => {
    const { id, photoId } = req.params as { id: string; photoId: string };

    const photo = await app.prisma.photo.findFirst({
      where: { id: photoId, dogId: id, dog: { ownerId: req.userId! } },
    });
    if (!photo) return reply.status(404).send({ error: 'Zdjęcie nie znalezione.' });

    await app.prisma.photo.delete({ where: { id: photoId } });
    return reply.status(204).send();
  });
}
