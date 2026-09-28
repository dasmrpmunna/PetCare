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
  ClipboardList,
  Pencil,
  Trash2,
  Send,
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  PawPrint,
} from 'lucide-react-native';
import { useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTask, getPet, toggleTaskComplete, deleteTask } = useData();
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const task = getTask(id);

  if (!task) {
    return (
      <View style={styles.container}>
        <Header title="Task Not Found" onBack={() => router.back()} />
        <EmptyState
          icon={<ClipboardList size={32} color={colors.primary.main} />}
          title="Task Not Found"
          message="This task may have been deleted"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const pet = getPet(task.petId);

  async function handleDelete() {
    setShowDelete(false);
    await deleteTask(id);
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Task Details"
        onBack={() => router.back()}
        rightIcon={<Pencil size={20} color={colors.primary.main} />}
        onRightPress={() => router.push(`/task/${task.id}/edit`)}
      />

      <Card style={styles.mainCard}>
        <View style={styles.titleRow}>
          <View style={[styles.statusIcon, task.completed && styles.statusIconDone]}>
            {task.completed ? (
              <CheckCircle2 size={24} color={colors.neutral[0]} />
            ) : (
              <Circle size={24} color={colors.primary.main} />
            )}
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
            <Badge
              label={task.category}
              bgColor={task.completed ? colors.neutral[200] : colors.primary[50]}
              color={task.completed ? colors.neutral[600] : colors.primary.dark}
            />
          </View>
        </View>

        {task.description ? (
          <View style={styles.descSection}>
            <View style={styles.descHeader}>
              <FileText size={16} color={colors.textSecondary} />
              <Text style={styles.descTitle}>Description</Text>
            </View>
            <Text style={styles.descText}>{task.description}</Text>
          </View>
        ) : null}

        <View style={styles.infoGrid}>
          <InfoItem
            icon={<PawPrint size={18} color={colors.primary.main} />}
            label="Pet"
            value={pet?.name || 'Unknown'}
          />
          <InfoItem
            icon={<Clock size={18} color={colors.primary.main} />}
            label="Time"
            value={task.scheduledTime}
          />
          <InfoItem
            icon={<Calendar size={18} color={colors.primary.main} />}
            label="Frequency"
            value={task.frequency === 'daily' ? 'Every Day' : DAYS[task.dayOfWeek]}
          />
          <InfoItem
            icon={<CheckCircle2 size={18} color={colors.primary.main} />}
            label="Status"
            value={task.completed ? 'Completed' : 'Pending'}
          />
        </View>
      </Card>

      <View style={styles.actionsRow}>
        <Button
          label={task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          onPress={() => toggleTaskComplete(task.id)}
          variant={task.completed ? 'outline' : 'primary'}
          icon={
            task.completed ? (
              <Circle size={18} color={colors.primary.main} />
            ) : (
              <CheckCircle2 size={18} color={colors.neutral[0]} />
            )
          }
        />
        <Button
          label="Delegate"
          onPress={() => router.push(`/sms-delegation?petId=${task.petId}&taskId=${task.id}`)}
          variant="outline"
          icon={<Send size={18} color={colors.accent.main} />}
        />
      </View>
      <View style={styles.actionsRow}>
        <Button
          label="Edit Task"
          onPress={() => router.push(`/task/${task.id}/edit`)}
          variant="outline"
          icon={<Pencil size={18} color={colors.primary.main} />}
        />
        <Button
          label="Delete"
          onPress={() => setShowDelete(true)}
          variant="danger"
          icon={<Trash2 size={18} color={colors.neutral[0]} />}
        />
      </View>

      <ConfirmDialog
        visible={showDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
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
  mainCard: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconDone: {
    backgroundColor: colors.primary.main,
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  descSection: {
    marginBottom: spacing.md,
  },
  descHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  descTitle: {
    ...typography.h4,
    color: colors.text,
  },
  descText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '45%',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});
