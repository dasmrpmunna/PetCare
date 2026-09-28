import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '@/lib/data';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { validateName } from '@/lib/validation';
import type { TaskCategory, TaskFrequency } from '@/lib/types';

const CATEGORIES: TaskCategory[] = ['Feeding', 'Walking', 'Grooming', 'Medication', 'Training', 'Vet Visit', 'Cleaning', 'Playtime', 'Other'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, getPet, pets, updateTask } = useData();
  const router = useRouter();
  const task = getTask(id);

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
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setFrequency(task.frequency);
      setPetId(task.petId);
      setScheduledTime(task.scheduledTime);
      setDayOfWeek(task.dayOfWeek);
    }
  }, [task?.id]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Header title="Task Not Found" onBack={() => router.back()} />
      </View>
    );
  }

  async function handleSave() {
    const titleErr = validateName(title);
    if (titleErr) {
      setErrors({ title: titleErr });
      return;
    }
    setErrors({});
    setLoading(true);
    await updateTask(id, {
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
        <Header title="Edit Task" onBack={() => router.back()} />

        <Input
          label="Task Title"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
          }}
          error={errors.title}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />

        <Text style={styles.label}>Pet</Text>
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
          <Button label="Save Changes" onPress={handleSave} loading={loading} />
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
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
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
