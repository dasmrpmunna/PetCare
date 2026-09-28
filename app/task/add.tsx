import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '@/lib/data';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { validateRequired, validateName } from '@/lib/validation';
import type { TaskCategory, TaskFrequency } from '@/lib/types';
import { ClipboardList } from 'lucide-react-native';

const CATEGORIES: TaskCategory[] = ['Feeding', 'Walking', 'Grooming', 'Medication', 'Training', 'Vet Visit', 'Cleaning', 'Playtime', 'Other'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export default function AddTaskScreen() {
  const { pets, addTask } = useData();
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Feeding');
  const [frequency, setFrequency] = useState<TaskFrequency>('daily');
  const [petId, setPetId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay());
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.petId) {
      setPetId(params.petId);
    } else if (pets.length > 0) {
      setPetId(pets[0].id);
    }
  }, [params.petId, pets]);

  async function handleSave() {
    const titleErr = validateName(title);
    if (!petId) {
      setErrors({ title: titleErr || undefined, petId: 'Please select a pet' });
      return;
    }
    if (titleErr) {
      setErrors({ title: titleErr });
      return;
    }
    setErrors({});
    setLoading(true);
    await addTask({
      title: title.trim(),
      description: description.trim(),
      category,
      frequency,
      petId,
      scheduledTime,
      dayOfWeek,
    });
    setLoading(false);
    router.back();
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Add Task" onBack={() => router.back()} />
        <View style={styles.noPets}>
          <Text style={styles.noPetsTitle}>No Pets Added</Text>
          <Text style={styles.noPetsText}>You need to add a pet before creating care tasks.</Text>
          <Button label="Add a Pet" onPress={() => router.push('/pet/add')} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="New Care Task" onBack={() => router.back()} />

        <Input
          label="Task Title"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
          }}
          error={errors.title}
          placeholder="e.g. Morning feeding, Evening walk"
          testID="task-title"
        />

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Additional details..."
          multiline
          numberOfLines={2}
        />

        <Text style={styles.label}>Select Pet</Text>
        {errors.petId ? <Text style={styles.errorText}>{errors.petId}</Text> : null}
        <View style={styles.chipsRow}>
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              label={pet.name}
              selected={petId === pet.id}
              onPress={() => setPetId(pet.id)}
            />
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
              color={colors.secondary.main}
            />
          ))}
        </View>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.freqRow}>
          <Chip label="Daily" selected={frequency === 'daily'} onPress={() => setFrequency('daily')} />
          <Chip label="Weekly" selected={frequency === 'weekly'} onPress={() => setFrequency('weekly')} color={colors.accent.main} />
        </View>

        {frequency === 'weekly' && (
          <>
            <Text style={styles.label}>Day of Week</Text>
            <View style={styles.chipsRow}>
              {DAYS.map((day, i) => (
                <Chip
                  key={day}
                  label={day}
                  selected={dayOfWeek === i}
                  onPress={() => setDayOfWeek(i)}
                  color={colors.accent.main}
                />
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Scheduled Time</Text>
        <View style={styles.chipsRow}>
          {TIMES.map((time) => (
            <Chip
              key={time}
              label={time}
              selected={scheduledTime === time}
              onPress={() => setScheduledTime(time)}
              color={colors.info}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Cancel" onPress={() => router.back()} variant="outline" />
          <Button
            label="Create Task"
            onPress={handleSave}
            loading={loading}
            icon={<ClipboardList size={18} color={colors.neutral[0]} />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  noPets: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  noPetsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  noPetsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  freqRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
