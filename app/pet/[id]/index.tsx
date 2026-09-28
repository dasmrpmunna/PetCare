import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '@/lib/data';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { ConfirmDialog } from '@/components/Feedback';
import { EmptyState } from '@/components/Feedback';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import {
  PawPrint,
  Pencil,
  Trash2,
  Send,
  ClipboardList,
  Calendar,
  Weight,
  Cake,
  FileText,
} from 'lucide-react-native';
import { useState } from 'react';
import { TaskRow } from '@/components/TaskRow';

const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦', Fish: '🐟', Rabbit: '🐰', Reptile: '🦎', Hamster: '🐹', Other: '🐾',
};

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, tasks, deleteTask, deletePet, toggleTaskComplete } = useData();
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const pet = getPet(id);

  if (!pet) {
    return (
      <View style={styles.container}>
        <Header title="Pet Not Found" onBack={() => router.back()} />
        <EmptyState
          icon={<PawPrint size={32} color={colors.primary.main} />}
          title="Pet Not Found"
          message="This pet may have been deleted"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const petTasks = tasks.filter((t) => t.petId === pet.id);
  const completedTasks = petTasks.filter((t) => t.completed).length;

  async function handleDelete() {
    setShowDelete(false);
    await deletePet(pet!.id);
    router.replace('/(tabs)/pets');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title={pet.name}
        onBack={() => router.back()}
        rightIcon={<Pencil size={20} color={colors.primary.main} />}
        onRightPress={() => router.push(`/pet/${pet.id}/edit`)}
      />

      {/* Hero */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroEmoji}>{SPECIES_EMOJI[pet.species] || '🐾'}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{pet.name}</Text>
            <Text style={styles.heroSpecies}>{pet.species}</Text>
            {pet.breed ? <Text style={styles.heroBreed}>{pet.breed}</Text> : null}
          </View>
          {pet.gender !== 'Unknown' && <Badge label={pet.gender} bgColor={colors.accent[50]} color={colors.accent[500]} />}
        </View>
        <View style={styles.statsRow}>
          <StatItem icon={<Cake size={16} color={colors.primary.main} />} label="Age" value={pet.age || '—'} />
          <StatItem icon={<Weight size={16} color={colors.primary.main} />} label="Weight" value={pet.weight || '—'} />
          <StatItem icon={<ClipboardList size={16} color={colors.primary.main} />} label="Tasks" value={`${completedTasks}/${petTasks.length}`} />
        </View>
      </Card>

      {pet.notes ? (
        <Card>
          <View style={styles.notesHeader}>
            <FileText size={18} color={colors.textSecondary} />
            <Text style={styles.notesTitle}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{pet.notes}</Text>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <Button
          label="Edit"
          onPress={() => router.push(`/pet/${pet.id}/edit`)}
          variant="outline"
          icon={<Pencil size={18} color={colors.primary.main} />}
        />
        <Button
          label="Delegate"
          onPress={() => router.push(`/sms-delegation?petId=${pet.id}`)}
          variant="outline"
          icon={<Send size={18} color={colors.accent.main} />}
        />
        <Button
          label="Delete"
          onPress={() => setShowDelete(true)}
          variant="danger"
          icon={<Trash2 size={18} color={colors.neutral[0]} />}
        />
      </View>

      {/* Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Care Tasks</Text>
        <Text style={styles.seeAll} onPress={() => router.push('/task/add')}>
          + Add Task
        </Text>
      </View>

      {petTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardList size={28} color={colors.primary.main} />}
            title="No Tasks"
            message={`No care tasks for ${pet.name} yet`}
            actionLabel="Add Task"
            onAction={() => router.push('/task/add')}
          />
        </Card>
      ) : (
        petTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            pet={pet}
            onToggle={() => toggleTaskComplete(task.id)}
            onDelete={() => {
              Alert.alert(
                'Delete Task',
                `Delete "${task.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
                ]
              );
            }}
            onPress={() => router.push(`/task/${task.id}`)}
          />
        ))
      )}

      <ConfirmDialog
        visible={showDelete}
        title="Delete Pet"
        message={`Are you sure you want to delete ${pet.name}? All associated care tasks will also be deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 32,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    ...typography.h2,
    color: colors.text,
  },
  heroSpecies: {
    ...typography.body,
    color: colors.primary.dark,
    fontWeight: '600',
  },
  heroBreed: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.h4,
    color: colors.text,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  notesTitle: {
    ...typography.h4,
    color: colors.text,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  seeAll: {
    ...typography.body2,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
