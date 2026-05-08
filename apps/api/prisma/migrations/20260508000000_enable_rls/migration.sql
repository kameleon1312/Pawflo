-- Enable Row Level Security on all public tables.
-- Prisma connects as the postgres superuser which bypasses RLS, so
-- existing application queries are unaffected. This blocks any direct
-- access via Supabase PostgREST (anon/authenticated roles).

ALTER TABLE public."User"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Dog"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Photo"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Swipe"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Match"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Message"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WeightEntry"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Vaccination"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VetVisit"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Medication"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Allergy"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Waitlist"     ENABLE ROW LEVEL SECURITY;
