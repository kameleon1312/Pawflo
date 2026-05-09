import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { swipeRoutes } from '../swipes';
import { buildApp, createVerifiedUser, createDog, cleanupUsers, nextIp } from '../../__tests__/helpers/buildApp';
import { signAccessToken } from '../../lib/jwt';

describe('swipe routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];

  let userAId: string;
  let userBId: string;
  let dogAId: string;
  let dogBId: string;
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    app = await buildApp(swipeRoutes, '/api/swipes');

    const ts = Date.now();
    const a = await createVerifiedUser(app, `swipe-a-${ts}@pawflo.test`);
    const b = await createVerifiedUser(app, `swipe-b-${ts}@pawflo.test`);
    userIds.push(a.user.id, b.user.id);
    userAId = a.user.id;
    userBId = b.user.id;
    tokenA = a.accessToken;
    tokenB = b.accessToken;

    const dogA = await createDog(app, userAId, 'Arek');
    const dogB = await createDog(app, userBId, 'Berta');
    dogAId = dogA.id;
    dogBId = dogB.id;
  });

  afterAll(async () => {
    await cleanupUsers(app, userIds);
    await app.close();
  });

  // ── Candidates ───────────────────────────────────────────────────────────────

  describe('GET /api/swipes/candidates', () => {
    it('returns 401 without auth', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/swipes/candidates', remoteAddress: nextIp() });
      expect(res.statusCode).toBe(401);
    });

    it('returns 200 with candidates list for authenticated user with a dog', async () => {
      const res = await app.inject({
        method: 'GET', url: '/api/swipes/candidates', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json<{ candidates: unknown[] }>();
      expect(Array.isArray(body.candidates)).toBe(true);
      // dogB is a valid candidate for dogA
      const ids = body.candidates.map((c: unknown) => (c as { id: string }).id);
      expect(ids).toContain(dogBId);
    });

    it('returns 404 when authenticated user has no dog', async () => {
      const ts = Date.now();
      const noDog = await createVerifiedUser(app, `swipe-nodg-${ts}@pawflo.test`);
      userIds.push(noDog.user.id);

      const res = await app.inject({
        method: 'GET', url: '/api/swipes/candidates', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${noDog.accessToken}` },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  // ── Create swipe ─────────────────────────────────────────────────────────────

  describe('POST /api/swipes', () => {
    it('returns 422 for invalid payload', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/swipes', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: { swipeeId: dogBId, direction: 'INVALID' },
      });
      expect(res.statusCode).toBe(422);
    });

    it('returns 400 when swiping own dog', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/swipes', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: { swipeeId: dogAId, direction: 'LIKE' },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 201 matched=false for a PASS swipe', async () => {
      // Use fresh users to avoid swipe state from other tests
      const ts = Date.now();
      const c = await createVerifiedUser(app, `swipe-c-${ts}@pawflo.test`);
      const d = await createVerifiedUser(app, `swipe-d-${ts}@pawflo.test`);
      userIds.push(c.user.id, d.user.id);
      const dogC = await createDog(app, c.user.id, 'Cesar');
      const dogD = await createDog(app, d.user.id, 'Dora');

      const res = await app.inject({
        method: 'POST', url: '/api/swipes', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${c.accessToken}` },
        payload: { swipeeId: dogD.id, direction: 'PASS' },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toMatchObject({ matched: false });
      void dogC; // used only for candidate pool
    });

    it('returns 201 matched=false for one-sided LIKE', async () => {
      const res = await app.inject({
        method: 'POST', url: '/api/swipes', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: { swipeeId: dogBId, direction: 'LIKE' },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toMatchObject({ matched: false });
    });

    it('returns 201 matched=true when both dogs LIKE each other', async () => {
      // dogA already liked dogB — dogB likes dogA back → match
      const res = await app.inject({
        method: 'POST', url: '/api/swipes', remoteAddress: nextIp(),
        headers: { Authorization: `Bearer ${tokenB}` },
        payload: { swipeeId: dogAId, direction: 'LIKE' },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json<{ matched: boolean; matchId: string }>();
      expect(body.matched).toBe(true);
      expect(body.matchId).toBeTruthy();
    });
  });
});
