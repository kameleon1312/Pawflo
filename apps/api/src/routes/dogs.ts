import type { FastifyInstance } from 'fastify';
import { CreateDogSchema, UpdateDogSchema } from '@pawflo/validation';
import { requireAuth } from '../middleware/requireAuth';
import { logger } from '../lib/logger';

export async function dogRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // GET /api/dogs — all dogs owned by current user
  app.get('/', async (req, reply) => {
    const dogs = await app.prisma.dog.findMany({
      where: { ownerId: req.userId!, deletedAt: null },
      include: { photos: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    return reply.send({ dogs });
  });

  // POST /api/dogs — create dog
  app.post('/', async (req, reply) => {
    const parsed = CreateDogSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { birthDate, ...rest } = parsed.data;
    const dog = await app.prisma.dog.create({
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : null,
        ownerId: req.userId!,
      },
      include: { photos: true },
    });

    logger.info({ event: 'dog.create', dogId: dog.id, userId: req.userId }, 'Dog created');
    return reply.status(201).send({ dog });
  });

  // GET /api/dogs/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await app.prisma.dog.findFirst({
      where: { id, ownerId: req.userId!, deletedAt: null },
      include: { photos: { orderBy: { order: 'asc' } } },
    });
    if (!dog) return reply.status(404).send({ error: 'Pies nie znaleziony.' });
    return reply.send({ dog });
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

    const { birthDate, ...rest } = parsed.data;
    const dog = await app.prisma.dog.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
      },
      include: { photos: { orderBy: { order: 'asc' } } },
    });
    return reply.send({ dog });
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
    const { url, order = 0 } = req.body as { url?: string; order?: number };

    if (!url || typeof url !== 'string') {
      return reply.status(422).send({ error: 'Brakuje pola url.' });
    }

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
