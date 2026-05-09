import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { healthRoutes } from '../health';
import { buildApp, createVerifiedUser, createDog, cleanupUsers, nextIp } from '../../__tests__/helpers/buildApp';

describe('health routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];
  let token: string;

  const NOW = new Date().toISOString();
  const FUTURE = new Date(Date.now() + 365 * 86_400_000).toISOString();

  beforeAll(async () => {
    app = await buildApp(healthRoutes, '/api/health');
    const { user, accessToken } = await createVerifiedUser(
      app,
      `health-${Date.now()}@pawflo.test`,
    );
    userIds.push(user.id);
    token = accessToken;
    await createDog(app, user.id, 'HealthDog');
  });

  afterAll(async () => {
    await cleanupUsers(app, userIds);
    await app.close();
  });

  function auth() { return { Authorization: `Bearer ${token}` }; }

  // ── Vaccinations ─────────────────────────────────────────────────────────────

  describe('vaccinations', () => {
    let vacId: string;

    it('GET /vaccinations returns empty array initially', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/health/vaccinations', remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(200);
      expect(res.json().vaccinations).toEqual([]);
    });

    it('POST /vaccinations creates a vaccination', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/vaccinations', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'Wścieklizna', date: NOW, validUntil: FUTURE },
      });
      expect(res.statusCode).toBe(201);
      const { vaccination } = res.json<{ vaccination: { id: string; name: string } }>();
      expect(vaccination.name).toBe('Wścieklizna');
      vacId = vaccination.id;
    });

    it('POST /vaccinations returns 422 for missing date', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/vaccinations', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'Test' }, // missing date
      });
      expect(res.statusCode).toBe(422);
    });

    it('DELETE /vaccinations/:id removes the record', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/api/health/vaccinations/${vacId}`, remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(204);
    });

    it('DELETE /vaccinations/:id returns 404 for non-existent id', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/health/vaccinations/nonexistent', remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(404);
    });
  });

  // ── Vet Visits ───────────────────────────────────────────────────────────────

  describe('visits', () => {
    let visitId: string;

    it('GET /visits returns empty array initially', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/health/visits', remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(200);
      expect(res.json().visits).toEqual([]);
    });

    it('POST /visits creates a visit', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/visits', remoteAddress: nextIp(), headers: auth(),
        payload: { date: NOW, notes: 'Kontrola roczna' },
      });
      expect(res.statusCode).toBe(201);
      const { visit } = res.json<{ visit: { id: string; notes: string } }>();
      expect(visit.notes).toBe('Kontrola roczna');
      visitId = visit.id;
    });

    it('DELETE /visits/:id removes the record', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/api/health/visits/${visitId}`, remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(204);
    });
  });

  // ── Weight ───────────────────────────────────────────────────────────────────

  describe('weight', () => {
    let entryId: string;

    it('GET /weight returns empty array initially', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/health/weight', remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(200);
      expect(res.json().entries).toEqual([]);
    });

    it('POST /weight creates a weight entry', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/weight', remoteAddress: nextIp(), headers: auth(),
        payload: { weightKg: 12.5, date: NOW },
      });
      expect(res.statusCode).toBe(201);
      const { entry } = res.json<{ entry: { id: string; weightKg: number } }>();
      expect(entry.weightKg).toBe(12.5);
      entryId = entry.id;
    });

    it('POST /weight returns 422 for negative weight', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/weight', remoteAddress: nextIp(), headers: auth(),
        payload: { weightKg: -1, date: NOW },
      });
      expect(res.statusCode).toBe(422);
    });

    it('DELETE /weight/:id removes the entry', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/api/health/weight/${entryId}`, remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(204);
    });
  });

  // ── Medications ──────────────────────────────────────────────────────────────

  describe('medications', () => {
    let medId: string;

    it('POST /medications creates a medication', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/medications', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'Apoquel', startDate: NOW, dosage: '1 tabletka', frequency: 'DAILY' },
      });
      expect(res.statusCode).toBe(201);
      const { medication } = res.json<{ medication: { id: string; name: string } }>();
      expect(medication.name).toBe('Apoquel');
      medId = medication.id;
    });

    it('PATCH /medications/:id updates the medication', async () => {
      const res = await app.inject({
        method: 'PATCH', url: `/api/health/medications/${medId}`, remoteAddress: nextIp(), headers: auth(),
        payload: { dosage: '2 tabletki' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().medication.dosage).toBe('2 tabletki');
    });

    it('POST /medications returns 422 for unknown frequency', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/medications', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'X', startDate: NOW, dosage: '1x', frequency: 'INVALID' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('DELETE /medications/:id removes the record', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/api/health/medications/${medId}`, remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(204);
    });
  });

  // ── Allergies ────────────────────────────────────────────────────────────────

  describe('allergies', () => {
    let allergyId: string;

    it('POST /allergies creates an allergy', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/allergies', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'Kurczak', severity: 'MILD' },
      });
      expect(res.statusCode).toBe(201);
      const { allergy } = res.json<{ allergy: { id: string; name: string } }>();
      expect(allergy.name).toBe('Kurczak');
      allergyId = allergy.id;
    });

    it('POST /allergies returns 422 for invalid severity', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/health/allergies', remoteAddress: nextIp(), headers: auth(),
        payload: { name: 'X', severity: 'EXTREME' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('DELETE /allergies/:id removes the record', async () => {
      const res = await app.inject({ method: 'DELETE', url: `/api/health/allergies/${allergyId}`, remoteAddress: nextIp(), headers: auth() });
      expect(res.statusCode).toBe(204);
    });
  });

  // ── Auth guard ───────────────────────────────────────────────────────────────

  it('returns 401 on any endpoint without a token', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health/vaccinations', remoteAddress: nextIp() });
    expect(res.statusCode).toBe(401);
  });
});
