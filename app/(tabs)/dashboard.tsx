import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { colors, typography, spacing, borderRadius, elevation } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/Feedback';
import { Badge } from '@/components/Badge';
import { PawPrint, Plus, ClipboardList, Calendar, Send, ChevronRight, CheckCircle2, Clock } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { getTodayStr } from '@/lib/data';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardScreen() {
  const { user } = useAuth();
  const { pets, tasks, dataLoading, toggleTaskComplete } = useData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const today = getTodayStr();
  const now = new Date();
  const todayTasks = tasks.filter((t) => {
    if (t.frequency === 'daily') return true;
    return t.dayOfWeek === now.getDay();
  });
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroGreeting}>Hello, {firstName}!</Text>
          <Text style={styles.heroDate}>
            {DAYS[now.getDay()]}, {MONTHS[now.getMonth()]} {now.getDate()}
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <PawPrint size={28} color={colors.neutral[0]} />
        </View>
      </View>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressSubtitle}>
              {completedToday} of {totalToday} tasks completed
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Button
          label="View Today's Checklist"
          onPress={() => router.push('/(tabs)/checklist')}
          variant="outline"
          icon={<ClipboardList size={18} color={colors.primary.main} />}
          fullWidth
        />
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <QuickAction
          icon={<Plus size={22} color={colors.neutral[0]} />}
          label="Add Pet"
          color={colors.primary.main}
          onPress={() => router.push('/pet/add')}
        />
        <QuickAction
          icon={<ClipboardList size={22} color={colors.neutral[0]} />}
          label="New Task"
          color={colors.secondary.main}
          onPress={() => router.push('/task/add')}
        />
        <QuickAction
          icon={<Send size={22} color={colors.neutral[0]} />}
          label="Delegate"
          color={colors.accent.main}
          onPress={() => router.push('/sms-delegation')}
        />
      </View>

      {/* Pets Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Pets</Text>
        {pets.length > 0 && (
          <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/pets')}>
            See All
          </Text>
        )}
      </View>
      {pets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PawPrint size={32} color={colors.primary.main} />}
            title="No Pets Yet"
            message="Add your first pet to start tracking their care"
            actionLabel="Add Pet"
            onAction={() => router.push('/pet/add')}
          />
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsScroll}>
          {pets.slice(0, 5).map((pet) => (
            <Card
              key={pet.id}
              style={styles.petMiniCard}
              onPress={() => router.push(`/pet/${pet.id}`)}
            >
              <View style={styles.petMiniIcon}>
                <PawPrint size={24} color={colors.primary.main} />
              </View>
              <Text style={styles.petMiniName} numberOfLines={1}>{pet.name}</Text>
              <Text style={styles.petMiniSpecies}>{pet.species}</Text>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Upcoming Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
        {todayTasks.length > 0 && (
          <Text style={styles.seeAll} onPress={() => router.push('/(tabs)/checklist')}>
            See All
          </Text>
        )}
      </View>
      {todayTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar size={32} color={colors.primary.main} />}
            title="No Tasks Today"
            message="Create care tasks to stay on top of your pet's routine"
            actionLabel="Add Task"
            onAction={() => router.push('/task/add')}
          />
        </Card>
      ) : (
        todayTasks.slice(0, 4).map((task) => {
          const pet = pets.find((p) => p.id === task.petId);
          return (
            <Card
              key={task.id}
              style={styles.taskCard}
              onPress={() => router.push(`/task/${task.id}`)}
            >
              <View style={styles.taskRow}>
                <View style={[styles.taskIcon, task.completed && styles.taskIconDone]}>
                  {task.completed ? (
                    <CheckCircle2 size={20} color={colors.neutral[0]} />
                  ) : (
                    <Clock size={20} color={colors.primary.main} />
                  )}
                </View>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskMeta} numberOfLines={1}>
                    {pet?.name || 'Unknown'} · {task.scheduledTime}
                  </Text>
                </View>
                <Badge
                  label={task.category}
                  bgColor={task.completed ? colors.neutral[200] : colors.primary[50]}
                  color={task.completed ? colors.neutral[600] : colors.primary.dark}
                />
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.quickActionWrap}>
      <Card style={styles.quickAction} onPress={onPress}>
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>{icon}</View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </Card>
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
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroGreeting: {
    ...typography.h2,
    color: colors.text,
  },
  heroDate: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text,
  },
  progressSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    ...typography.h4,
    color: colors.primary.dark,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    marginBottom: spacing.md,
  overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seeAll: {
    ...typography.body2,
    color: colors.primary.main,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionWrap: {
    flex: 1,
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginVertical: 0,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
  },
  petsScroll: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  petMiniCard: {
    width: 120,
    alignItems: 'center',
    marginVertical: 0,
    marginRight: spacing.sm,
  },
  petMiniIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  petMiniName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  petMiniSpecies: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  taskCard: {
    marginVertical: spacing.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconDone: {
    backgroundColor: colors.primary.main,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
