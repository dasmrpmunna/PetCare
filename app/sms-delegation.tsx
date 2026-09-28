import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Badge } from '@/components/Badge';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { validateName, validatePhone, validateRequired } from '@/lib/validation';
import { Send, Phone, MessageSquare, CheckCircle2, PawPrint, ClipboardList } from 'lucide-react-native';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SmsDelegationScreen() {
  const { petId, taskId } = useLocalSearchParams<{ petId?: string; taskId?: string }>();
  const { pets, tasks, delegations, addDelegation } = useData();
  const { user } = useAuth();
  const router = useRouter();

  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (petId) setSelectedPetId(petId);
    else if (pets.length > 0) setSelectedPetId(pets[0].id);
    if (taskId) setSelectedTaskId(taskId);
  }, [petId, taskId, pets]);

  // Auto-generate message based on selections
  useEffect(() => {
    const pet = pets.find((p) => p.id === selectedPetId);
    const task = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
    if (pet && task) {
      const freqText = task.frequency === 'daily' ? 'daily' : `${DAYS[task.dayOfWeek]}`;
      setMessage(
        `Hi ${caregiverName || '[caregiver]'}, could you help with ${task.title} for ${pet.name} (${pet.species})? It's a ${freqText} task scheduled at ${task.scheduledTime}. ${task.description ? `Details: ${task.description}` : ''} Thanks! - ${user?.name || ''}`
      );
    } else if (pet) {
      setMessage(
        `Hi ${caregiverName || '[caregiver]'}, could you help care for ${pet.name} (${pet.species})? Please let me know if you can help. Thanks! - ${user?.name || ''}`
      );
    }
  }, [selectedPetId, selectedTaskId, caregiverName, pets, tasks, user?.name]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const petTasks = selectedPet ? tasks.filter((t) => t.petId === selectedPet.id) : [];

  async function handleSend() {
    const nameErr = validateName(caregiverName);
    const phoneErr = validatePhone(caregiverPhone);
    const msgErr = validateRequired(message, 'Message');
    const petErr = !selectedPetId ? 'Please select a pet' : null;

    if (nameErr || phoneErr || msgErr || petErr) {
      setErrors({
        caregiverName: nameErr || undefined,
        caregiverPhone: phoneErr || undefined,
        message: msgErr || undefined,
        pet: petErr || undefined,
      });
      return;
    }
    setErrors({});
    setLoading(true);

    // Save delegation record
    await addDelegation({
      petId: selectedPetId,
      taskId: selectedTaskId,
      caregiverName: caregiverName.trim(),
      caregiverPhone: caregiverPhone.trim(),
      message: message.trim(),
    });

    // Open SMS app with pre-filled message
    const smsUrl = Platform.select({
      ios: `sms:${caregiverPhone.trim()}&body=${encodeURIComponent(message)}`,
      android: `sms:${caregiverPhone.trim()}?body=${encodeURIComponent(message)}`,
      default: `sms:${caregiverPhone.trim()}?body=${encodeURIComponent(message)}`,
    });

    try {
      await Linking.openURL(smsUrl || '');
    } catch {
      Alert.alert('Info', 'Could not open the SMS app. The delegation has been saved.');
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      router.back();
    }, 1500);
  }

  if (pets.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="SMS Delegation" onBack={() => router.back()} />
        <View style={styles.empty}>
          <PawPrint size={48} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>No Pets Added</Text>
          <Text style={styles.emptyText}>Add a pet before delegating care tasks.</Text>
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
        <Header title="SMS Delegation" onBack={() => router.back()} />

        {success ? (
          <Card style={styles.successCard}>
            <View style={styles.successRow}>
              <CheckCircle2 size={32} color={colors.success} />
              <View>
                <Text style={styles.successTitle}>Delegation Sent!</Text>
                <Text style={styles.successText}>The care task has been delegated to {caregiverName}.</Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Text style={styles.sectionLabel}>Select Pet</Text>
        {errors.pet ? <Text style={styles.errorText}>{errors.pet}</Text> : null}
        <View style={styles.chipsRow}>
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              label={pet.name}
              selected={selectedPetId === pet.id}
              onPress={() => {
                setSelectedPetId(pet.id);
                setSelectedTaskId(null);
              }}
            />
          ))}
        </View>

        {selectedPet && petTasks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Select Task (optional)</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="No specific task"
                selected={selectedTaskId === null}
                onPress={() => setSelectedTaskId(null)}
                color={colors.neutral[500]}
              />
              {petTasks.map((task) => (
                <Chip
                  key={task.id}
                  label={task.title}
                  selected={selectedTaskId === task.id}
                  onPress={() => setSelectedTaskId(task.id)}
                  color={colors.secondary.main}
                />
              ))}
            </View>
          </>
        )}

        <Input
          label="Caregiver Name"
          value={caregiverName}
          onChangeText={(t) => {
            setCaregiverName(t);
            if (errors.caregiverName) setErrors((e) => ({ ...e, caregiverName: undefined }));
          }}
          error={errors.caregiverName}
          placeholder="e.g. Jane Smith"
          testID="delegation-name"
        />

        <Input
          label="Caregiver Phone"
          value={caregiverPhone}
          onChangeText={(t) => {
            setCaregiverPhone(t);
            if (errors.caregiverPhone) setErrors((e) => ({ ...e, caregiverPhone: undefined }));
          }}
          error={errors.caregiverPhone}
          placeholder="e.g. 555-123-4567"
          keyboardType="phone-pad"
          testID="delegation-phone"
        />

        <Input
          label="Message"
          value={message}
          onChangeText={(t) => {
            setMessage(t);
            if (errors.message) setErrors((e) => ({ ...e, message: undefined }));
          }}
          error={errors.message}
          multiline
          numberOfLines={4}
          testID="delegation-message"
        />

        <Button
          label="Send via SMS"
          onPress={handleSend}
          loading={loading}
          icon={<Send size={18} color={colors.neutral[0]} />}
          fullWidth
        />

        {/* History */}
        {delegations.length > 0 ? (
          <>
            <Text style={styles.historyTitle}>Recent Delegations</Text>
            {delegations.slice(-5).reverse().map((d) => {
              const pet = pets.find((p) => p.id === d.petId);
              const task = d.taskId ? tasks.find((t) => t.id === d.taskId) : null;
              return (
                <Card key={d.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyIcon}>
                      <Phone size={16} color={colors.accent.main} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{d.caregiverName}</Text>
                      <Text style={styles.historyPhone}>{d.caregiverPhone}</Text>
                      <Text style={styles.historyMeta}>
                        {pet?.name || 'Unknown pet'}
                        {task ? ` · ${task.title}` : ''}
                      </Text>
                    </View>
                    <Badge label={new Date(d.sentAt).toLocaleDateString()} />
                  </View>
                </Card>
              );
            })}
          </>
        ) : null}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionLabel: {
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
  successCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.success + '15',
    borderColor: colors.success,
    borderWidth: 1,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  successTitle: {
    ...typography.h4,
    color: colors.success,
  },
  successText: {
    ...typography.body2,
    color: colors.text,
  },
  historyTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyCard: {
    marginVertical: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  historyPhone: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.primary.dark,
    marginTop: 2,
  },
});
