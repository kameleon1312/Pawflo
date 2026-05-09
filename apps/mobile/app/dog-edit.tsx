import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, FontSize, Spacing } from '@pawflo/theme';
import { useDogs, useUpdateDog, useUploadPhoto, useDeletePhoto } from '@/hooks/useDogs';

const SEX_OPTIONS = [
  { value: 'MALE',   label: 'Samiec' },
  { value: 'FEMALE', label: 'Samica' },
] as const;

const SIZE_OPTIONS = [
  { value: 'SMALL',  label: 'Mały' },
  { value: 'MEDIUM', label: 'Średni' },
  { value: 'LARGE',  label: 'Duży' },
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'CALM',     label: 'Spokojny' },
  { value: 'MODERATE', label: 'Umiarkowany' },
  { value: 'ACTIVE',   label: 'Bardzo aktywny' },
] as const;

const ALL_TRAITS = [
  { value: 'PLAYFUL',      label: 'Zabawowy' },
  { value: 'CALM',         label: 'Spokojny' },
  { value: 'FRIENDLY',     label: 'Towarzyski' },
  { value: 'PROTECTIVE',   label: 'Opiekuńczy' },
  { value: 'ENERGETIC',    label: 'Energiczny' },
  { value: 'LAZY',         label: 'Leniwy' },
  { value: 'CURIOUS',      label: 'Ciekawski' },
  { value: 'GENTLE',       label: 'Delikatny' },
  { value: 'SHY',          label: 'Nieśmiały' },
  { value: 'AFFECTIONATE', label: 'Czuły' },
  { value: 'INDEPENDENT',  label: 'Niezależny' },
  { value: 'SOCIAL',       label: 'Społeczny' },
  { value: 'TRAINABLE',    label: 'Podatny na trening' },
] as const;

const MAX_PHOTOS = 6;

export default function DogEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: dogs, isLoading } = useDogs();
  const dog = dogs?.[0];

  const [name,          setName]          = useState(dog?.name ?? '');
  const [breed,         setBreed]         = useState(dog?.breed ?? '');
  const [sex,           setSex]           = useState<'MALE' | 'FEMALE'>(dog?.sex ?? 'MALE');
  const [size,          setSize]          = useState<'SMALL' | 'MEDIUM' | 'LARGE'>(dog?.size ?? 'MEDIUM');
  const [activityLevel, setActivityLevel] = useState<'CALM' | 'MODERATE' | 'ACTIVE'>(dog?.activityLevel ?? 'MODERATE');
  const [bio,           setBio]           = useState(dog?.bio ?? '');
  const [traits,        setTraits]        = useState<string[]>(dog?.traits ?? []);
  const [weight,        setWeight]        = useState(dog?.weight != null ? String(dog.weight) : '');

  const { mutate: updateDog, isPending: saving } = useUpdateDog();
  const { mutate: uploadPhoto, isPending: uploading } = useUploadPhoto();
  const { mutate: deletePhoto } = useDeletePhoto();

  function toggleTrait(value: string) {
    setTraits((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : prev.length < 8
          ? [...prev, value]
          : prev,
    );
  }

  function handleSave() {
    if (!dog || !name.trim()) {
      Alert.alert('', 'Imię psa jest wymagane.');
      return;
    }

    const weightNum = weight ? parseFloat(weight.replace(',', '.')) : null;
    if (weight && (isNaN(weightNum!) || weightNum! <= 0 || weightNum! > 150)) {
      Alert.alert('', 'Podaj prawidłową wagę (0–150 kg).');
      return;
    }

    updateDog(
      {
        id: dog.id,
        data: {
          name: name.trim(),
          breed: breed.trim() || null,
          sex,
          size,
          activityLevel,
          bio: bio.trim() || null,
          traits,
          weight: weightNum,
        },
      },
      {
        onSuccess: () => router.back(),
        onError: (err) =>
          Alert.alert('Błąd', err instanceof Error ? err.message : 'Nie udało się zapisać.'),
      },
    );
  }

  async function handlePickPhoto() {
    if (!dog) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('', 'Brak dostępu do galerii. Włącz uprawnienia w ustawieniach.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    uploadPhoto(
      {
        dogId: dog.id,
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
      },
      { onError: () => Alert.alert('', 'Nie udało się przesłać zdjęcia.') },
    );
  }

  function handleDeletePhoto(photoId: string) {
    if (!dog) return;
    Alert.alert('Usuń zdjęcie', 'Na pewno chcesz usunąć to zdjęcie?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => deletePhoto({ dogId: dog.id, photoId }) },
    ]);
  }

  if (isLoading || !dog) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator color={Colors.coral} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const photos = dog.photos;
  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Wróć">
          <Ionicons name="arrow-back" size={24} color={Colors.cream} />
        </Pressable>
        <Text style={styles.headerTitle}>Edytuj psa</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          hitSlop={8}
          accessibilityLabel="Zapisz zmiany"
        >
          {saving
            ? <ActivityIndicator size="small" color={Colors.coral} />
            : <Text style={styles.saveText}>Zapisz</Text>}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Zdjęcia ── */}
        <Text style={styles.sectionLabel}>Zdjęcia</Text>
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCell}>
              <Image source={{ uri: photo.url }} style={styles.photo} contentFit="cover" />
              <Pressable
                style={styles.photoDeleteBtn}
                onPress={() => handleDeletePhoto(photo.id)}
                accessibilityLabel="Usuń zdjęcie"
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={Colors.cream} />
              </Pressable>
            </View>
          ))}

          {canAddMore && (
            <Pressable
              style={styles.addPhotoCell}
              onPress={handlePickPhoto}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel="Dodaj zdjęcie"
            >
              {uploading
                ? <ActivityIndicator color={Colors.coralSoft} />
                : (
                  <>
                    <Ionicons name="add" size={28} color={Colors.coralSoft} />
                    <Text style={styles.addPhotoText}>Dodaj</Text>
                  </>
                )}
            </Pressable>
          )}
        </View>

        {/* ── Podstawowe dane ── */}
        <Text style={styles.sectionLabel}>Podstawowe dane</Text>
        <View style={styles.card}>
          <Field label="Imię *">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Imię psa"
              placeholderTextColor={Colors.textFaint}
              maxLength={50}
            />
          </Field>

          <Field label="Rasa">
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="np. Labrador"
              placeholderTextColor={Colors.textFaint}
              maxLength={100}
            />
          </Field>

          <Field label="Waga (kg)">
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="np. 12.5"
              placeholderTextColor={Colors.textFaint}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </Field>
        </View>

        {/* ── Płeć ── */}
        <Text style={styles.sectionLabel}>Płeć</Text>
        <View style={styles.segmentRow}>
          {SEX_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.segment, sex === opt.value && styles.segmentActive]}
              onPress={() => setSex(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: sex === opt.value }}
            >
              <Text style={[styles.segmentText, sex === opt.value && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Rozmiar ── */}
        <Text style={styles.sectionLabel}>Rozmiar</Text>
        <View style={styles.segmentRow}>
          {SIZE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.segment, size === opt.value && styles.segmentActive]}
              onPress={() => setSize(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: size === opt.value }}
            >
              <Text style={[styles.segmentText, size === opt.value && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Aktywność ── */}
        <Text style={styles.sectionLabel}>Poziom aktywności</Text>
        <View style={styles.segmentRow}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.segment, activityLevel === opt.value && styles.segmentActive]}
              onPress={() => setActivityLevel(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activityLevel === opt.value }}
            >
              <Text style={[styles.segmentText, activityLevel === opt.value && styles.segmentTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Cechy ── */}
        <Text style={styles.sectionLabel}>Cechy charakteru (max 8)</Text>
        <View style={styles.traitsGrid}>
          {ALL_TRAITS.map((t) => {
            const active = traits.includes(t.value);
            return (
              <Pressable
                key={t.value}
                style={[styles.traitPill, active && styles.traitPillActive]}
                onPress={() => toggleTrait(t.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
              >
                <Text style={[styles.traitText, active && styles.traitTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Bio ── */}
        <Text style={styles.sectionLabel}>O psie</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Kilka słów o psie…"
            placeholderTextColor={Colors.textFaint}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/500</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const PHOTO_CELL = 96;

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.15)',
  },
  headerTitle: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h4,
    color: Colors.cream,
  },
  saveText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.coral,
  },

  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },

  // Photos
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoCell: {
    width: PHOTO_CELL,
    height: PHOTO_CELL,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: { width: PHOTO_CELL, height: PHOTO_CELL },
  photoDeleteBtn: { position: 'absolute', top: 3, right: 3 },
  addPhotoCell: {
    width: PHOTO_CELL,
    height: PHOTO_CELL,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.coralSoft,
  },

  // Card / inputs
  card: {
    backgroundColor: Colors.inkSoft,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  field: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.1)',
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.textFaint,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    minHeight: 36,
    paddingVertical: 0,
  },
  bioInput: { minHeight: 90 },
  charCount: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.textFaint,
    textAlign: 'right',
    paddingBottom: 8,
    paddingTop: 4,
  },

  // Segments
  segmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 48,
  },
  segmentActive: {
    borderColor: Colors.coral,
    backgroundColor: 'rgba(240,138,138,0.1)',
  },
  segmentText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
  },
  segmentTextActive: {
    color: Colors.coral,
  },

  // Traits
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  traitPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  traitPillActive: {
    borderColor: Colors.coral,
    backgroundColor: 'rgba(240,138,138,0.1)',
  },
  traitText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
  },
  traitTextActive: { color: Colors.coral },
});
