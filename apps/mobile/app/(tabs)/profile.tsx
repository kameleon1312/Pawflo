import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useDogs } from '@/hooks/useDogs';
import { useLogout, useDeleteAccount, useExportData } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useDogs';

const PLAN_LABEL: Record<string, string> = {
  FREE: 'Darmowy',
  PLUS: 'Plus',
  PRO: 'Pro',
};

const SEX_LABEL: Record<string, string> = { MALE: 'Samiec', FEMALE: 'Samica' };
const SIZE_LABEL: Record<string, string> = { SMALL: 'Mały', MEDIUM: 'Średni', LARGE: 'Duży' };
const ACTIVITY_LABEL: Record<string, string> = { CALM: 'Spokojny', MODERATE: 'Umiarkowany', ACTIVE: 'Bardzo aktywny' };

export default function ProfileScreen() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const logout  = useLogout();
  const dogs    = useDogs();
  const updateProfile = useUpdateProfile();

  const deleteAccount = useDeleteAccount();
  const exportData    = useExportData();

  const [editOpen,       setEditOpen]       = useState(false);
  const [deleteOpen,     setDeleteOpen]     = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [firstName,      setFirstName]      = useState(user?.firstName ?? '');
  const [lastName,       setLastName]       = useState(user?.lastName ?? '');

  const dog = dogs.data?.[0] ?? null;

  function openEdit() {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEditOpen(true);
  }

  async function saveProfile() {
    await updateProfile.mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim() });
    setEditOpen(false);
  }

  async function handleExport() {
    try {
      const data = await exportData.mutateAsync();
      await Share.share({
        title: 'PawFlo — eksport danych',
        message: JSON.stringify(data, null, 2),
      });
    } catch {
      Alert.alert('Błąd', 'Nie udało się pobrać danych. Spróbuj ponownie.');
    }
  }

  function confirmLogout() {
    Alert.alert('Wylogowanie', 'Na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Wyloguj', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  }

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : 'Twój profil';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={Colors.coral} />
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{PLAN_LABEL[user?.plan ?? 'FREE']}</Text>
          </View>
        </View>

        {/* ── Dane konta ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Konto</Text>
            <Pressable onPress={openEdit} hitSlop={8}>
              <Ionicons name="pencil" size={16} color={Colors.coral} />
            </Pressable>
          </View>

          <Row label="Imię"     value={user?.firstName ?? '—'} />
          <Row label="Nazwisko" value={user?.lastName  ?? '—'} />
          <Row label="E-mail"   value={user?.email     ?? '—'} />
        </View>

        {/* ── Profil psa ── */}
        {dogs.isLoading ? (
          <ActivityIndicator color={Colors.coral} style={{ marginTop: 24 }} />
        ) : dog ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Twój pies</Text>
              <Pressable onPress={() => router.push('/dog-edit' as Href)} hitSlop={8}>
                <Ionicons name="pencil" size={16} color={Colors.coral} />
              </Pressable>
            </View>

            <Row label="Imię"       value={dog.name} />
            {dog.breed  ? <Row label="Rasa"  value={dog.breed} /> : null}
            <Row label="Płeć"       value={SEX_LABEL[dog.sex]      ?? dog.sex} />
            <Row label="Rozmiar"    value={SIZE_LABEL[dog.size]     ?? dog.size} />
            <Row label="Aktywność"  value={ACTIVITY_LABEL[dog.activityLevel] ?? dog.activityLevel} />
            {dog.traits.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Cechy</Text>
                <View style={styles.traitWrap}>
                  {dog.traits.map((t) => (
                    <View key={t} style={styles.traitPill}>
                      <Text style={styles.traitText}>{t.toLowerCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : null}

        {/* ── Wylogowanie ── */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.7 }]}
          onPress={confirmLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.coral} />
          <Text style={styles.logoutText}>Wyloguj się</Text>
        </Pressable>

        {/* ── Pobierz dane (RODO) ── */}
        <Pressable
          style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.7 }, exportData.isPending && { opacity: 0.5 }]}
          onPress={handleExport}
          disabled={exportData.isPending}
        >
          {exportData.isPending
            ? <ActivityIndicator size="small" color={Colors.textFaint} />
            : <Ionicons name="download-outline" size={18} color={Colors.textFaint} />}
          <Text style={styles.exportText}>Pobierz moje dane</Text>
        </Pressable>

        {/* ── Usuń konto ── */}
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
          onPress={() => { setDeletePassword(''); setDeleteOpen(true); }}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.deleteText}>Usuń konto</Text>
        </Pressable>

      </ScrollView>

      {/* ── Modal usuwania konta ── */}
      <Modal
        visible={deleteOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDeleteOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setDeleteOpen(false)} hitSlop={8}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Usuń konto</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.deleteWarning}>
              Twoje konto zostanie usunięte bezpowrotnie po 30 dniach. Wszystkie dane, dopasowania i historia zostaną skasowane.
            </Text>

            <Text style={styles.inputLabel}>Potwierdź hasłem</Text>
            <TextInput
              style={styles.input}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Twoje hasło"
              placeholderTextColor={Colors.textFaint}
              secureTextEntry
              autoComplete="current-password"
            />

            {deleteAccount.isError && (
              <Text style={styles.errorText}>
                {deleteAccount.error instanceof Error
                  ? deleteAccount.error.message
                  : 'Coś poszło nie tak.'}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [styles.deleteConfirmBtn, pressed && { opacity: 0.8 }, deleteAccount.isPending && { opacity: 0.5 }]}
              onPress={() => deleteAccount.mutate(deletePassword)}
              disabled={deleteAccount.isPending || !deletePassword}
            >
              {deleteAccount.isPending
                ? <ActivityIndicator color={Colors.cream} />
                : <Text style={styles.deleteConfirmText}>Usuń moje konto</Text>}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Modal edycji profilu ── */}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditOpen(false)} hitSlop={8}>
              <Text style={styles.modalCancel}>Anuluj</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Edytuj profil</Text>
            <Pressable onPress={saveProfile} disabled={updateProfile.isPending} hitSlop={8}>
              {updateProfile.isPending
                ? <ActivityIndicator size="small" color={Colors.coral} />
                : <Text style={styles.modalSave}>Zapisz</Text>}
            </Pressable>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Imię</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Imię"
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="words"
            />
            <Text style={styles.inputLabel}>Nazwisko</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nazwisko"
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="words"
            />
            {updateProfile.isError && (
              <Text style={styles.errorText}>
                {updateProfile.error instanceof Error
                  ? updateProfile.error.message
                  : 'Coś poszło nie tak.'}
              </Text>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  scroll: { paddingBottom: 40 },

  // Header
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 24 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.inkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  displayName: {
    fontFamily: 'Fraunces-Bold',
    fontSize: FontSize.h2,
    color: Colors.cream,
    marginBottom: 4,
  },
  email: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
    marginBottom: 10,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.coral,
  },
  planText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.coral,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.inkSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.12)',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Rows
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.08)',
  },
  rowLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.textFaint,
    flex: 1,
  },
  rowValue: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.cream,
    flex: 2,
    textAlign: 'right',
  },

  // Traits
  traitWrap: { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' },
  traitPill: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inkSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  traitText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.caption,
    color: Colors.textFaint,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240,138,138,0.3)',
    backgroundColor: 'rgba(240,138,138,0.06)',
    minHeight: 52,
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.coral,
  },

  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,219,197,0.12)',
    minHeight: 52,
    justifyContent: 'center',
  },
  exportText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.textFaint,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.25)',
    backgroundColor: 'rgba(220,53,69,0.06)',
    minHeight: 52,
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.danger,
  },

  deleteWarning: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.bone,
    lineHeight: FontSize.bodySm * 1.6,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(220,53,69,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.2)',
  },
  deleteConfirmBtn: {
    marginTop: 16,
    backgroundColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  deleteConfirmText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    fontWeight: '600',
  },

  // Modal
  modalSafe:   { flex: 1, backgroundColor: Colors.ink },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.15)',
  },
  modalTitle:  { fontFamily: 'Fraunces-Bold', fontSize: FontSize.h4, color: Colors.cream },
  modalCancel: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textFaint },
  modalSave:   { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.coral },
  modalBody:   { padding: 24 },
  inputLabel:  {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.inkSoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    minHeight: 52,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
    marginTop: 12,
    textAlign: 'center',
  },
});
