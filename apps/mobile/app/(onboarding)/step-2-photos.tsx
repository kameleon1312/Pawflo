import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, FontSize, Spacing } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useDogs, useUploadPhoto, useDeletePhoto } from '@/hooks/useDogs';

const s = strings.onboarding.step2;
const MAX_PHOTOS = 6;

export default function Step2PhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: dogs } = useDogs();
  const dog = dogs?.[0];

  const { mutate: uploadPhoto, isPending: uploading } = useUploadPhoto();
  const { mutate: deletePhoto } = useDeletePhoto();

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('', s.permissionError);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.85,
    });

    if (result.canceled || !dog) return;

    const asset = result.assets[0];
    if (!asset) return;

    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;

    uploadPhoto(
      { dogId: dog.id, uri: asset.uri, mimeType, fileName },
      { onError: () => Alert.alert('', s.uploadError) },
    );
  }

  function handleDelete(photoId: string) {
    if (!dog) return;
    deletePhoto({ dogId: dog.id, photoId });
  }

  function handleNext() {
    router.push('/(onboarding)/step-3-traits' as Href);
  }

  const photos = dog?.photos ?? [];
  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.step}>2 / 3</Text>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.subtitle}>{s.subtitle}</Text>
        </View>

        <View style={styles.grid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCell}>
              <Image source={{ uri: photo.url }} style={styles.photo} contentFit="cover" />
              <Pressable
                style={styles.deleteBtn}
                onPress={() => handleDelete(photo.id)}
                accessibilityLabel={s.deletePhoto}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={Colors.cream} />
              </Pressable>
            </View>
          ))}

          {canAddMore && (
            <Pressable
              style={styles.addCell}
              onPress={handlePickPhoto}
              disabled={uploading}
              accessibilityRole="button"
              accessibilityLabel={s.addPhoto}
            >
              {uploading ? (
                <ActivityIndicator color={Colors.coralSoft} />
              ) : (
                <>
                  <Ionicons name="add" size={32} color={Colors.coralSoft} />
                  <Text style={styles.addText}>{s.addPhoto}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable
            style={styles.cta}
            onPress={handleNext}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{photos.length > 0 ? s.cta : s.skipCta}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CELL_SIZE = 104;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.ink },
  root: { flex: 1, paddingHorizontal: 24 },

  header: { paddingTop: 16, marginBottom: 32 },
  step: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.micro,
    color: Colors.coralSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h1,
    color: Colors.cream,
    lineHeight: FontSize.h1 * 1.18,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    lineHeight: FontSize.bodySm * 1.6,
  },

  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignContent: 'flex-start',
  },
  photoCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  addCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.coralSoft,
    textAlign: 'center',
  },

  footer: { paddingTop: 12, backgroundColor: Colors.ink },
  cta: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Cabinet Grotesk-Bold',
    fontSize: FontSize.body,
    color: Colors.cream,
  },
});
