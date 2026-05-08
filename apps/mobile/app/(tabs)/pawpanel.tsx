import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize } from '@pawflo/theme';
import { strings } from '@/i18n/strings.pl';
import { useDogs } from '@/hooks/useDogs';
import {
  useVaccinations, useAddVaccination, useDeleteVaccination,
  useVetVisits,    useAddVetVisit,    useDeleteVetVisit,
  useWeight,       useAddWeight,      useDeleteWeight,
  useMedications,  useAddMedication,  useDeleteMedication,
  useAllergies,    useAddAllergy,     useDeleteAllergy,
} from '@/hooks/usePawPanel';
import { WeightChart } from '@/components/ui/WeightChart';
import type { Allergy, Medication, Vaccination, VetVisit, WeightEntry } from '@pawflo/types';

const s   = strings.pawpanel;
const { width: SCREEN_W } = Dimensions.get('window');

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parsePolishDate(input: string): string | null {
  const m = input.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo!.padStart(2, '0')}-${d!.padStart(2, '0')}T00:00:00.000Z`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── Shared modal shell ───────────────────────────────────────────────────────

function AddModal({
  visible, title, onClose, onSave, saving, error, children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={ms.safe} edges={['top', 'bottom']}>
        <View style={ms.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={ms.cancel}>{s.cancel}</Text>
          </Pressable>
          <Text style={ms.title}>{title}</Text>
          <Pressable onPress={onSave} disabled={saving} hitSlop={8}>
            {saving
              ? <ActivityIndicator size="small" color={Colors.coral} />
              : <Text style={ms.save}>{s.save}</Text>}
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[ms.body, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
          {error ? <Text style={ms.error}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title, icon, onAdd, children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={sc.card}>
      <View style={sc.header}>
        <View style={sc.titleRow}>
          <Ionicons name={icon} size={16} color={Colors.coral} />
          <Text style={sc.title}>{title}</Text>
        </View>
        <Pressable style={sc.addBtn} onPress={onAdd} hitSlop={8} accessibilityRole="button">
          <Ionicons name="add" size={20} color={Colors.coral} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PawPanelScreen() {
  const dogs = useDogs();
  const dog  = dogs.data?.[0] ?? null;

  const vaccinations = useVaccinations();
  const addVaccination    = useAddVaccination();
  const deleteVaccination = useDeleteVaccination();

  const visits    = useVetVisits();
  const addVisit  = useAddVetVisit();
  const deleteVisit = useDeleteVetVisit();

  const weightEntries = useWeight();
  const addWeight     = useAddWeight();
  const deleteWeight  = useDeleteWeight();

  const medications   = useMedications();
  const addMedication = useAddMedication();
  const deleteMedication = useDeleteMedication();

  const allergies   = useAllergies();
  const addAllergy  = useAddAllergy();
  const deleteAllergy = useDeleteAllergy();

  // Modal states
  const [modal, setModal] = useState<
    'weight' | 'vaccination' | 'visit' | 'medication' | 'allergy' | null
  >(null);

  // Weight form
  const [weightInput, setWeightInput] = useState('');
  const [weightDate,  setWeightDate]  = useState('');

  // Vaccination form
  const [vacName,  setVacName]  = useState('');
  const [vacDate,  setVacDate]  = useState('');
  const [vacUntil, setVacUntil] = useState('');

  // Visit form
  const [visitDate,  setVisitDate]  = useState('');
  const [visitNotes, setVisitNotes] = useState('');

  // Medication form
  const [medName,  setMedName]  = useState('');
  const [medDose,  setMedDose]  = useState('');
  const [medStart, setMedStart] = useState('');
  const [medEnd,   setMedEnd]   = useState('');
  const [medFreq,  setMedFreq]  = useState<'DAILY'|'WEEKLY'|'MONTHLY'|'AS_NEEDED'>('DAILY');

  // Allergy form
  const [allergyName,     setAllergyName]     = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'MILD'|'MODERATE'|'SEVERE'>('MILD');

  const [formError, setFormError] = useState<string | null>(null);

  function openModal(type: typeof modal) {
    setFormError(null);
    setModal(type);
  }

  function closeModal() { setModal(null); setFormError(null); }

  // ── Save handlers ────────────────────────────────────────────────────────────

  async function saveWeight() {
    const kg = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(kg) || kg <= 0) { setFormError('Podaj prawidłową wagę.'); return; }
    const date = parsePolishDate(weightDate) ?? new Date().toISOString();
    try {
      await addWeight.mutateAsync({ weightKg: kg, date });
      setWeightInput(''); setWeightDate('');
      closeModal();
    } catch { setFormError(s.errorGeneric); }
  }

  async function saveVaccination() {
    if (!vacName.trim()) { setFormError('Podaj nazwę szczepionki.'); return; }
    const date = parsePolishDate(vacDate);
    if (!date) { setFormError(s.invalidDate); return; }
    const validUntil = vacUntil ? parsePolishDate(vacUntil) : null;
    if (vacUntil && !validUntil) { setFormError(s.invalidDate); return; }
    try {
      await addVaccination.mutateAsync({ name: vacName.trim(), date, validUntil });
      setVacName(''); setVacDate(''); setVacUntil('');
      closeModal();
    } catch { setFormError(s.errorGeneric); }
  }

  async function saveVisit() {
    const date = parsePolishDate(visitDate);
    if (!date) { setFormError(s.invalidDate); return; }
    try {
      await addVisit.mutateAsync({ date, notes: visitNotes.trim() || null });
      setVisitDate(''); setVisitNotes('');
      closeModal();
    } catch { setFormError(s.errorGeneric); }
  }

  async function saveMedication() {
    if (!medName.trim() || !medDose.trim()) { setFormError('Wypełnij nazwę i dawkowanie.'); return; }
    const startDate = parsePolishDate(medStart);
    if (!startDate) { setFormError(s.invalidDate); return; }
    const endDate = medEnd ? parsePolishDate(medEnd) : null;
    if (medEnd && !endDate) { setFormError(s.invalidDate); return; }
    try {
      await addMedication.mutateAsync({
        name: medName.trim(), dosage: medDose.trim(),
        startDate, endDate, frequency: medFreq,
      });
      setMedName(''); setMedDose(''); setMedStart(''); setMedEnd('');
      closeModal();
    } catch { setFormError(s.errorGeneric); }
  }

  async function saveAllergy() {
    if (!allergyName.trim()) { setFormError('Podaj nazwę alergenu.'); return; }
    try {
      await addAllergy.mutateAsync({ name: allergyName.trim(), severity: allergySeverity });
      setAllergyName('');
      closeModal();
    } catch { setFormError(s.errorGeneric); }
  }

  function confirmDelete(label: string, onConfirm: () => void) {
    Alert.alert('Usuń wpis', `Usunąć "${label}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: onConfirm },
    ]);
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const latestWeight  = weightEntries.data?.at(-1);
  const nextVaccine   = vaccinations.data
    ?.filter((v) => v.validUntil && new Date(v.validUntil) > new Date())
    .sort((a, b) => new Date(a.validUntil!).getTime() - new Date(b.validUntil!).getTime())[0] ?? null;
  const activeMeds    = medications.data?.filter(
    (m) => !m.endDate || new Date(m.endDate) >= new Date(),
  ) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{s.title}</Text>
          {dog && <Text style={styles.dogName}>{dog.name}</Text>}
        </View>

        {/* ── Weight ─────────────────────────────────────────────────── */}
        <SectionCard
          title={s.sections.weight}
          icon="scale-outline"
          onAdd={() => openModal('weight')}
        >
          {latestWeight ? (
            <Text style={styles.bigStat}>
              {latestWeight.weightKg.toFixed(1)}
              <Text style={styles.bigStatUnit}> {s.weight.unit}</Text>
            </Text>
          ) : (
            <Text style={styles.emptyText}>{s.weight.noData}</Text>
          )}
          {(weightEntries.data?.length ?? 0) > 0 && (
            <WeightChart
              entries={weightEntries.data!}
              width={SCREEN_W - 64}
              height={110}
            />
          )}
        </SectionCard>

        {/* ── Vaccinations ───────────────────────────────────────────── */}
        <SectionCard
          title={s.sections.vaccinations}
          icon="medkit-outline"
          onAdd={() => openModal('vaccination')}
        >
          {nextVaccine ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{s.vaccinations.nextLabel}</Text>
              <Text style={styles.rowValue}>{nextVaccine.name} · {formatDate(nextVaccine.validUntil!)}</Text>
            </View>
          ) : null}
          {(vaccinations.data?.length ?? 0) === 0 && (
            <Text style={styles.emptyText}>{s.vaccinations.noData}</Text>
          )}
          {vaccinations.data?.map((v) => (
            <VaccinationRow key={v.id} item={v} onDelete={() =>
              confirmDelete(v.name, () => deleteVaccination.mutate(v.id))
            } />
          ))}
        </SectionCard>

        {/* ── Medications ────────────────────────────────────────────── */}
        <SectionCard
          title={s.sections.medications}
          icon="medical-outline"
          onAdd={() => openModal('medication')}
        >
          {activeMeds.length > 0 ? (
            activeMeds.map((m) => (
              <MedicationRow key={m.id} item={m} onDelete={() =>
                confirmDelete(m.name, () => deleteMedication.mutate(m.id))
              } />
            ))
          ) : (
            <Text style={styles.emptyText}>{s.medications.noData}</Text>
          )}
        </SectionCard>

        {/* ── Vet visits ─────────────────────────────────────────────── */}
        <SectionCard
          title={s.sections.visits}
          icon="calendar-outline"
          onAdd={() => openModal('visit')}
        >
          {(visits.data?.length ?? 0) === 0 ? (
            <Text style={styles.emptyText}>{s.visits.noData}</Text>
          ) : (
            visits.data?.map((v) => (
              <VisitRow key={v.id} item={v} onDelete={() =>
                confirmDelete(formatDate(v.date), () => deleteVisit.mutate(v.id))
              } />
            ))
          )}
        </SectionCard>

        {/* ── Allergies ──────────────────────────────────────────────── */}
        <SectionCard
          title={s.sections.allergies}
          icon="warning-outline"
          onAdd={() => openModal('allergy')}
        >
          {(allergies.data?.length ?? 0) === 0 ? (
            <Text style={styles.emptyText}>{s.allergies.noData}</Text>
          ) : (
            <View style={styles.pillRow}>
              {allergies.data?.map((a) => (
                <AllergyPill key={a.id} item={a} onDelete={() =>
                  confirmDelete(a.name, () => deleteAllergy.mutate(a.id))
                } />
              ))}
            </View>
          )}
        </SectionCard>
      </ScrollView>

      {/* ── Modals ────────────────────────────────────────────────────── */}

      {/* Weight */}
      <AddModal
        visible={modal === 'weight'}
        title={s.weight.modalTitle}
        onClose={closeModal}
        onSave={saveWeight}
        saving={addWeight.isPending}
        error={formError}
      >
        <FormInput
          label={s.weight.weightLabel}
          value={weightInput}
          onChangeText={setWeightInput}
          placeholder={s.weight.weightPlaceholder}
          keyboardType="decimal-pad"
        />
        <FormInput
          label="Data"
          value={weightDate}
          onChangeText={setWeightDate}
          placeholder={s.weight.datePlaceholder}
          keyboardType="numbers-and-punctuation"
        />
      </AddModal>

      {/* Vaccination */}
      <AddModal
        visible={modal === 'vaccination'}
        title={s.vaccinations.modalTitle}
        onClose={closeModal}
        onSave={saveVaccination}
        saving={addVaccination.isPending}
        error={formError}
      >
        <FormInput
          label={s.vaccinations.nameLabel}
          value={vacName}
          onChangeText={setVacName}
          placeholder={s.vaccinations.namePlaceholder}
          autoCapitalize="sentences"
        />
        <FormInput
          label="Data podania"
          value={vacDate}
          onChangeText={setVacDate}
          placeholder={s.vaccinations.datePlaceholder}
          keyboardType="numbers-and-punctuation"
        />
        <FormInput
          label="Ważne do (opcjonalnie)"
          value={vacUntil}
          onChangeText={setVacUntil}
          placeholder={s.vaccinations.validUntilPlaceholder}
          keyboardType="numbers-and-punctuation"
        />
      </AddModal>

      {/* Visit */}
      <AddModal
        visible={modal === 'visit'}
        title={s.visits.modalTitle}
        onClose={closeModal}
        onSave={saveVisit}
        saving={addVisit.isPending}
        error={formError}
      >
        <FormInput
          label="Data wizyty"
          value={visitDate}
          onChangeText={setVisitDate}
          placeholder={s.visits.datePlaceholder}
          keyboardType="numbers-and-punctuation"
        />
        <FormInput
          label="Notatki"
          value={visitNotes}
          onChangeText={setVisitNotes}
          placeholder={s.visits.notesPlaceholder}
          multiline
        />
      </AddModal>

      {/* Medication */}
      <AddModal
        visible={modal === 'medication'}
        title={s.medications.modalTitle}
        onClose={closeModal}
        onSave={saveMedication}
        saving={addMedication.isPending}
        error={formError}
      >
        <FormInput
          label={s.medications.nameLabel}
          value={medName}
          onChangeText={setMedName}
          placeholder={s.medications.namePlaceholder}
          autoCapitalize="sentences"
        />
        <FormInput
          label={s.medications.dosageLabel}
          value={medDose}
          onChangeText={setMedDose}
          placeholder={s.medications.dosagePlaceholder}
        />
        <FormInput
          label="Data rozpoczęcia"
          value={medStart}
          onChangeText={setMedStart}
          placeholder={s.medications.startPlaceholder}
          keyboardType="numbers-and-punctuation"
        />
        <FormInput
          label="Data zakończenia (opcjonalnie)"
          value={medEnd}
          onChangeText={setMedEnd}
          placeholder={s.medications.endPlaceholder}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={ms.inputLabel}>Częstotliwość</Text>
        <View style={styles.pillRow}>
          {(['DAILY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED'] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.freqPill, medFreq === f && styles.freqPillActive]}
              onPress={() => setMedFreq(f)}
            >
              <Text style={[styles.freqPillText, medFreq === f && styles.freqPillTextActive]}>
                {s.medications.frequency[f]}
              </Text>
            </Pressable>
          ))}
        </View>
      </AddModal>

      {/* Allergy */}
      <AddModal
        visible={modal === 'allergy'}
        title={s.allergies.modalTitle}
        onClose={closeModal}
        onSave={saveAllergy}
        saving={addAllergy.isPending}
        error={formError}
      >
        <FormInput
          label="Alergen"
          value={allergyName}
          onChangeText={setAllergyName}
          placeholder={s.allergies.namePlaceholder}
          autoCapitalize="sentences"
        />
        <Text style={ms.inputLabel}>Nasilenie</Text>
        <View style={styles.pillRow}>
          {(['MILD', 'MODERATE', 'SEVERE'] as const).map((sev) => (
            <Pressable
              key={sev}
              style={[styles.freqPill, allergySeverity === sev && styles.freqPillActive]}
              onPress={() => setAllergySeverity(sev)}
            >
              <Text style={[styles.freqPillText, allergySeverity === sev && styles.freqPillTextActive]}>
                {s.allergies.severity[sev]}
              </Text>
            </Pressable>
          ))}
        </View>
      </AddModal>
    </SafeAreaView>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function VaccinationRow({ item, onDelete }: { item: Vaccination; onDelete: () => void }) {
  return (
    <Pressable style={styles.itemRow} onLongPress={onDelete}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>{formatDate(item.date)}{item.validUntil ? ` → ${formatDate(item.validUntil)}` : ''}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={16} color={Colors.textFaint} />
      </Pressable>
    </Pressable>
  );
}

function MedicationRow({ item, onDelete }: { item: Medication; onDelete: () => void }) {
  const freq = strings.pawpanel.medications.frequency[item.frequency] ?? item.frequency;
  return (
    <Pressable style={styles.itemRow} onLongPress={onDelete}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name} · {item.dosage}</Text>
        <Text style={styles.itemMeta}>{freq}{item.endDate ? ` do ${formatDate(item.endDate)}` : ''}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={16} color={Colors.textFaint} />
      </Pressable>
    </Pressable>
  );
}

function VisitRow({ item, onDelete }: { item: VetVisit; onDelete: () => void }) {
  return (
    <Pressable style={styles.itemRow} onLongPress={onDelete}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{formatDate(item.date)}</Text>
        {item.notes ? <Text style={styles.itemMeta} numberOfLines={2}>{item.notes}</Text> : null}
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={16} color={Colors.textFaint} />
      </Pressable>
    </Pressable>
  );
}

function AllergyPill({ item, onDelete }: { item: Allergy; onDelete: () => void }) {
  const severityColor: Record<string, string> = {
    MILD: Colors.bone,
    MODERATE: Colors.coralSoft,
    SEVERE: Colors.coral,
  };
  return (
    <Pressable
      style={[styles.allergyPill, { borderColor: severityColor[item.severity] ?? Colors.bone }]}
      onLongPress={onDelete}
    >
      <Text style={[styles.allergyPillText, { color: severityColor[item.severity] ?? Colors.bone }]}>
        {item.name}
      </Text>
    </Pressable>
  );
}

// ─── FormInput helper ─────────────────────────────────────────────────────────

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, multiline, autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  multiline?: boolean;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
}) {
  return (
    <>
      <Text style={ms.inputLabel}>{label}</Text>
      <TextInput
        style={[ms.input, multiline && ms.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? 'none'}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  flex:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 20, paddingHorizontal: 4 },
  title:   { fontFamily: 'Fraunces-Bold', fontSize: FontSize.h2, color: Colors.cream },
  dogName: { fontFamily: Fonts.sans, fontSize: FontSize.bodySm, color: Colors.coralSoft },

  bigStat: { fontFamily: 'Fraunces-Bold', fontSize: 40, color: Colors.cream, marginBottom: 8 },
  bigStatUnit: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.bone },

  emptyText: { fontFamily: Fonts.sans, fontSize: FontSize.bodySm, color: Colors.textFaint, paddingVertical: 4 },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.textFaint, flex: 1 },
  rowValue: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.bone, flex: 2, textAlign: 'right' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.08)',
    gap: 8,
  },
  itemName: { fontFamily: Fonts.sans, fontSize: FontSize.bodySm, color: Colors.cream },
  itemMeta: { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.textFaint, marginTop: 2 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },

  allergyPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  allergyPillText: { fontFamily: Fonts.sans, fontSize: FontSize.caption },

  freqPill: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.inkSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 36,
    justifyContent: 'center',
  },
  freqPillActive:     { borderColor: Colors.coral, backgroundColor: 'rgba(240,138,138,0.12)' },
  freqPillText:       { fontFamily: Fonts.sans, fontSize: FontSize.caption, color: Colors.bone },
  freqPillTextActive: { color: Colors.coral },
});

// Section card styles
const sc = StyleSheet.create({
  card: {
    backgroundColor: Colors.inkSoft,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Modal styles
const ms = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.ink },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(229,219,197,0.15)',
  },
  title:  { fontFamily: 'Fraunces-Bold', fontSize: FontSize.h4, color: Colors.cream },
  cancel: { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.textFaint },
  save:   { fontFamily: Fonts.sans, fontSize: FontSize.body, color: Colors.coral },
  body:   { padding: 24 },
  inputLabel: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.label,
    color: Colors.bone,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.sans,
    fontSize: FontSize.body,
    color: Colors.cream,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(229,219,197,0.1)',
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  error: {
    fontFamily: Fonts.sans,
    fontSize: FontSize.bodySm,
    color: Colors.coral,
    marginTop: 16,
    textAlign: 'center',
  },
});
