import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ViewStyle,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useData, getTodayStr } from '@/lib/data';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState, ConfirmDialog } from '@/components/Feedback';
import { Badge } from '@/components/Badge';
import { CheckSquare, RefreshCw, Trash2, Check, RotateCcw } from 'lucide-react-native';
import type { CareTask } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ChecklistScreen() {
  const { tasks, pets, toggleTaskComplete, deleteTask, resetTodaysTasks, dataLoading } = useData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CareTask | null>(null);
  const [showShakeAlert, setShowShakeAlert] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const lastShakeRef = useRef(0);

  const now = new Date();
  const todayTasks = tasks.filter((t) => {
    if (t.frequency === 'daily') return true;
    return t.dayOfWeek === now.getDay();
  });

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  // Shake detection
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: { remove: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { Accelerometer } = await import('expo-sensors');
        if (cancelled) return;
        Accelerometer.setUpdateInterval(400);
        subscription = Accelerometer.addListener((data) => {
          const total = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
          const now = Date.now();
          if (total > 2.5 && now - lastShakeRef.current > 2000) {
            lastShakeRef.current = now;
            setShowShakeAlert(true);
          }
        });
        subscriptionRef.current = subscription;
      } catch {
        // Shake detection is unavailable on this platform.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  async function handleShakeReset() {
    await resetTodaysTasks();
    setShowShakeAlert(false);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  function renderItem({ item }: { item: CareTask }) {
    const pet = pets.find((p) => p.id === item.petId);
    return (
      <SwipeableTaskRow
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
          <Text style={styles.title}>Today's Checklist</Text>
          <Text style={styles.subtitle}>
            {completedCount} of {totalCount} completed
          </Text>
        </View>
        <Button
          label="Reset"
          onPress={() => setShowShakeAlert(true)}
          variant="outline"
          icon={<RefreshCw size={16} color={colors.primary.main} />}
          fullWidth={false}
        />
      </View>

      {totalCount > 0 && (
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBar, { width: `${(completedCount / totalCount) * 100}%` }]}
          />
        </View>
      )}

      {todayTasks.length === 0 && !dataLoading ? (
        <EmptyState
          icon={<CheckSquare size={32} color={colors.primary.main} />}
          title="No Tasks Today"
          message="Create care tasks to see them in your daily checklist"
          actionLabel="Add Task"
          onAction={() => router.push('/task/add')}
        />
      ) : (
        <FlatList
          data={todayTasks}
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

      <ConfirmDialog
        visible={showShakeAlert}
        title="Reset Today's Checklist"
        message="Shake detected! Do you want to reset all tasks for today? This will mark all tasks as incomplete."
        confirmLabel="Reset All"
        onConfirm={handleShakeReset}
        onCancel={() => setShowShakeAlert(false)}
      />
    </View>
  );
}

// Swipeable row with gesture-based delete (left) and complete (right)
function SwipeableTaskRow({
  task,
  pet,
  onToggle,
  onDelete,
  onPress,
}: {
  task: CareTask;
  pet: any;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);

  const SWIPE_THRESHOLD = 100;

  function handleRelease() {
    setAnimating(true);
    if (offset <= -SWIPE_THRESHOLD) {
      // Swipe left -> delete
      onDelete();
      setOffset(0);
    } else if (offset >= SWIPE_THRESHOLD) {
      // Swipe right -> mark complete
      onToggle();
      setOffset(0);
    } else {
      setOffset(0);
    }
    setTimeout(() => setAnimating(false), 300);
  }

  const bg = offset < 0 ? colors.error : colors.success;
  const bgIcon = offset < 0 ? <Trash2 size={24} color={colors.neutral[0]} /> : <Check size={24} color={colors.neutral[0]} />;

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.swipeBg, { backgroundColor: bg }]}>
        <View style={styles.swipeBgIconLeft}>{bgIcon}</View>
        <View style={styles.swipeBgIconRight}>{bgIcon}</View>
      </View>
      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => {
          (e as any)._startX = e.nativeEvent.locationX;
          (e as any)._startOffset = offset;
        }}
        onResponderMove={(e) => {
          const start = (e as any)._startX || 0;
          const startOffset = (e as any)._startOffset || 0;
          const dx = e.nativeEvent.locationX - start;
          const newOffset = Math.max(-160, Math.min(160, startOffset + dx));
          setOffset(newOffset);
        }}
        onResponderRelease={handleRelease}
        onResponderTerminate={() => setOffset(0)}
        style={[
          styles.swipeContent,
          {
            transform: [{ translateX: offset }],
            transition: animating ? 'transform 0.3s ease' : 'none',
          } as ViewStyle,
        ]}
      >
        <Card onPress={onPress} style={styles.taskCard}>
          <View style={styles.taskRow}>
            <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
              {task.completed && <Check size={18} color={colors.neutral[0]} />}
            </View>
            <View style={styles.taskContent}>
              <View style={styles.taskTopRow}>
                <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Badge label={task.category} />
              </View>
              <Text style={styles.taskMeta} numberOfLines={1}>
                {pet?.name || 'Unknown'} · {task.scheduledTime}
              </Text>
            </View>
          </View>
        </Card>
      </View>
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
  progressBarBg: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  swipeContainer: {
    position: 'relative',
    marginVertical: spacing.xs,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  swipeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  swipeBgIconLeft: {
    padding: spacing.sm,
  },
  swipeBgIconRight: {
    padding: spacing.sm,
  },
  swipeContent: {
    position: 'relative',
    zIndex: 1,
  },
  taskCard: {
    marginVertical: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.primary.main,
  },
  taskContent: {
    flex: 1,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
