import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

const KEYS = {
  vaccinations: ['health', 'vaccinations'] as const,
  visits:       ['health', 'visits']       as const,
  weight:       ['health', 'weight']       as const,
  medications:  ['health', 'medications']  as const,
  allergies:    ['health', 'allergies']    as const,
};

// ── Vaccinations ──────────────────────────────────────────────────────────────

export function useVaccinations() {
  return useQuery({
    queryKey: KEYS.vaccinations,
    queryFn: () => api.health.vaccinations().then((r) => r.vaccinations),
  });
}

export function useAddVaccination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.addVaccination,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.vaccinations }),
  });
}

export function useDeleteVaccination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.deleteVaccination,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.vaccinations }),
  });
}

// ── Vet Visits ────────────────────────────────────────────────────────────────

export function useVetVisits() {
  return useQuery({
    queryKey: KEYS.visits,
    queryFn: () => api.health.visits().then((r) => r.visits),
  });
}

export function useAddVetVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.addVisit,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.visits }),
  });
}

export function useDeleteVetVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.deleteVisit,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.visits }),
  });
}

// ── Weight ────────────────────────────────────────────────────────────────────

export function useWeight() {
  return useQuery({
    queryKey: KEYS.weight,
    queryFn: () => api.health.weight().then((r) => r.entries),
  });
}

export function useAddWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.addWeight,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.weight }),
  });
}

export function useDeleteWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.deleteWeight,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.weight }),
  });
}

// ── Medications ───────────────────────────────────────────────────────────────

export function useMedications() {
  return useQuery({
    queryKey: KEYS.medications,
    queryFn: () => api.health.medications().then((r) => r.medications),
  });
}

export function useAddMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.addMedication,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.medications }),
  });
}

export function useDeleteMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.deleteMedication,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.medications }),
  });
}

// ── Allergies ─────────────────────────────────────────────────────────────────

export function useAllergies() {
  return useQuery({
    queryKey: KEYS.allergies,
    queryFn: () => api.health.allergies().then((r) => r.allergies),
  });
}

export function useAddAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.addAllergy,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.allergies }),
  });
}

export function useDeleteAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.health.deleteAllergy,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.allergies }),
  });
}
