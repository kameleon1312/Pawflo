import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { useAuthStore } from '@/stores/authStore';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const hasDog  = useAuthStore((s) => s.hasDog);

  return useMutation({
    mutationFn: api.users.update,
    onSuccess: ({ user }) => setUser(user, hasDog),
  });
}

const DOGS_KEY = ['dogs'] as const;

export function useDogs() {
  return useQuery({
    queryKey: DOGS_KEY,
    queryFn: () => api.dogs.list().then((r) => r.dogs),
  });
}

export function useCreateDog() {
  const qc = useQueryClient();
  const setHasDog = useAuthStore((s) => s.setHasDog);

  return useMutation({
    mutationFn: api.dogs.create,
    onSuccess: () => {
      setHasDog(true);
      qc.invalidateQueries({ queryKey: DOGS_KEY });
    },
  });
}

export function useUpdateDog() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.dogs.update>[1] }) =>
      api.dogs.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOGS_KEY });
    },
  });
}

export function useUploadPhoto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      dogId,
      uri,
      mimeType,
      fileName,
    }: {
      dogId: string;
      uri: string;
      mimeType: string;
      fileName: string;
    }) => api.dogs.uploadPhoto(dogId, uri, mimeType, fileName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOGS_KEY });
    },
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ dogId, photoId }: { dogId: string; photoId: string }) =>
      api.dogs.removePhoto(dogId, photoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOGS_KEY });
    },
  });
}

export function useDeleteDog() {
  const qc = useQueryClient();
  const setHasDog = useAuthStore((s) => s.setHasDog);

  return useMutation({
    mutationFn: api.dogs.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: DOGS_KEY });
      const dogs = qc.getQueryData<Awaited<ReturnType<typeof api.dogs.list>>['dogs']>(DOGS_KEY);
      if (!dogs || dogs.length === 0) setHasDog(false);
    },
  });
}
