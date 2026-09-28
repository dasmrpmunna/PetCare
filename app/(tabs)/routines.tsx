import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/lib/data';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState, ConfirmDialog } from '@/components/Feedback';
import { Badge } from '@/components/Badge';
import { TaskRow } from '@/components/TaskRow';
import { Calendar, Plus, ClipboardList } from 'lucide-react-native';
import type { CareTask } from '@/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesScreen() {
  const { tasks, pets, deleteTask, toggleTaskComplete, dataLoading } = useData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareTask | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const filteredTasks = selectedDay !== null
    ? tasks.filter((t) => t.frequency === 'weekly' && t.dayOfWeek === selectedDay)
    : tasks;

  function renderItem({ item }: { item: CareTask }) {
    const pet = pets.find((p) => p.id === item.petId);
    return (
      <TaskRow
        task={item}
        pet={pet}
        onToggle={() => toggleTaskComplete(item.id)}
        onDelete={() => setDeleteTarget(item)}
        onPress={() => router.push(`/task/${item.id}`)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Care Routines</Text>
          <Text style={styles.subtitle}>{tasks.length} total tasks</Text>
        </View>
        <Button
          label="Add"
          onPress={() => router.push('/task/add')}
          icon={<Plus size={18} color={colors.neutral[0]} />}
          fullWidth={false}
        />
      </View>

      {/* Day filter chips */}
      <View style={styles.dayFilterRow}>
        <Pressable
          style={[styles.dayChip, selectedDay === null && styles.dayChipActive]}
          onPress={() => setSelectedDay(null)}
        >
          <Text style={[styles.dayChipText, selectedDay === null && styles.dayChipTextActive]}>All</Text>
        </Pressable>
        {DAYS.map((day, i) => {
          const active = selectedDay === i;
          const count = tasks.filter((t) => t.frequency === 'weekly' && t.dayOfWeek === i).length;
          return (
            <Pressable
              key={day}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => setSelectedDay(active ? null : i)}
            >
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{day}</Text>
              {count > 0 && <Text style={[styles.dayChipCount, active && styles.dayChipCountActive]}>{count}</Text>}
            </Pressable>
          );
        })}
      </View>

      {filteredTasks.length === 0 && !dataLoading ? (
        <EmptyState
          icon={<Calendar size={32} color={colors.primary.main} />}
          title={selectedDay !== null ? `No Tasks for ${DAY_FULL[selectedDay]}` : 'No Care Routines'}
          message="Create care tasks to build your pet's daily and weekly routines"
          actionLabel="Add Task"
          onAction={() => router.push('/task/add')}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          extraData={tasks}
        />
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          if (deleteTarget) await deleteTask(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  dayFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  dayChipActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main,
  },
  dayChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  dayChipTextActive: {
    color: colors.neutral[0],
  },
  dayChipCount: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  dayChipCountActive: {
    color: colors.neutral[100],
  },
  list: {
    paddingBottom: spacing.xl,
  },
});
