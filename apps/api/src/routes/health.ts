import type { FastifyInstance } from 'fastify';
import {
  CreateVaccinationSchema,
  CreateVetVisitSchema,
  CreateWeightSchema,
  CreateMedicationSchema,
  UpdateMedicationSchema,
  CreateAllergySchema,
} from '@pawflo/validation';
import { requireAuth } from '../middleware/requireAuth';

async function getMyDog(app: FastifyInstance, userId: string) {
  return app.prisma.dog.findFirst({
    where: { ownerId: userId, deletedAt: null },
    select: { id: true },
  });
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireAuth);

  // ── Vaccinations ───────────────────────────────────────────────────────────

  app.get('/vaccinations', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.send({ vaccinations: [] });
    const vaccinations = await app.prisma.vaccination.findMany({
      where: { dogId: dog.id },
      orderBy: { date: 'desc' },
    });
    return reply.send({ vaccinations });
  });

  app.post('/vaccinations', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const parsed = CreateVaccinationSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { date, validUntil, ...rest } = parsed.data;
    const vaccination = await app.prisma.vaccination.create({
      data: {
        ...rest,
        dogId: dog.id,
        date: new Date(date),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });
    return reply.status(201).send({ vaccination });
  });

  app.delete('/vaccinations/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.vaccination.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    await app.prisma.vaccination.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── Vet Visits ─────────────────────────────────────────────────────────────

  app.get('/visits', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.send({ visits: [] });
    const visits = await app.prisma.vetVisit.findMany({
      where: { dogId: dog.id },
      orderBy: { date: 'desc' },
    });
    return reply.send({ visits });
  });

  app.post('/visits', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const parsed = CreateVetVisitSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { date, ...rest } = parsed.data;
    const visit = await app.prisma.vetVisit.create({
      data: { ...rest, dogId: dog.id, date: new Date(date) },
    });
    return reply.status(201).send({ visit });
  });

  app.delete('/visits/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.vetVisit.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    await app.prisma.vetVisit.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── Weight ─────────────────────────────────────────────────────────────────

  app.get('/weight', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.send({ entries: [] });
    const entries = await app.prisma.weightEntry.findMany({
      where: { dogId: dog.id },
      orderBy: { date: 'asc' },
    });
    return reply.send({ entries });
  });

  app.post('/weight', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const parsed = CreateWeightSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { date, weightKg } = parsed.data;
    const entry = await app.prisma.weightEntry.create({
      data: { dogId: dog.id, weightKg, date: new Date(date) },
    });
    return reply.status(201).send({ entry });
  });

  app.delete('/weight/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.weightEntry.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    await app.prisma.weightEntry.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── Medications ────────────────────────────────────────────────────────────

  app.get('/medications', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.send({ medications: [] });
    const medications = await app.prisma.medication.findMany({
      where: { dogId: dog.id },
      orderBy: { startDate: 'desc' },
    });
    return reply.send({ medications });
  });

  app.post('/medications', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const parsed = CreateMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { startDate, endDate, ...rest } = parsed.data;
    const medication = await app.prisma.medication.create({
      data: {
        ...rest,
        dogId: dog.id,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return reply.status(201).send({ medication });
  });

  app.patch('/medications/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.medication.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    const parsed = UpdateMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const { startDate, endDate, ...rest } = parsed.data;
    const medication = await app.prisma.medication.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
      },
    });
    return reply.send({ medication });
  });

  app.delete('/medications/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.medication.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    await app.prisma.medication.delete({ where: { id } });
    return reply.status(204).send();
  });

  // ── Allergies ──────────────────────────────────────────────────────────────

  app.get('/allergies', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.send({ allergies: [] });
    const allergies = await app.prisma.allergy.findMany({
      where: { dogId: dog.id },
      orderBy: { createdAt: 'asc' },
    });
    return reply.send({ allergies });
  });

  app.post('/allergies', async (req, reply) => {
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const parsed = CreateAllergySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Nieprawidłowe dane.', details: parsed.error.flatten() });
    }

    const allergy = await app.prisma.allergy.create({
      data: { ...parsed.data, dogId: dog.id },
    });
    return reply.status(201).send({ allergy });
  });

  app.delete('/allergies/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const dog = await getMyDog(app, req.userId!);
    if (!dog) return reply.status(404).send({ error: 'Nie masz psa w profilu.' });

    const existing = await app.prisma.allergy.findFirst({ where: { id, dogId: dog.id } });
    if (!existing) return reply.status(404).send({ error: 'Nie znaleziono.' });

    await app.prisma.allergy.delete({ where: { id } });
    return reply.status(204).send();
  });
}
