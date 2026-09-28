import { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Card } from './Card';
import { Badge } from './Badge';
import { Check, Trash2, Clock, Calendar } from 'lucide-react-native';
import type { CareTask, Pet } from '@/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TaskRowProps {
  task: CareTask;
  pet?: Pet;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}

export function TaskRow({ task, pet, onToggle, onDelete, onPress }: TaskRowProps) {
  return (
    <Card
      onPress={onPress}
      style={[
        styles.card,
        task.completed && styles.cardCompleted,
      ]}
    >
      <View style={styles.row}>
        <Pressable
          onPress={onToggle}
          style={[styles.checkbox, task.completed && styles.checkboxDone]}
        >
          {task.completed && <Check size={18} color={colors.neutral[0]} />}
        </Pressable>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text
              style={[styles.title, task.completed && styles.titleDone]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <Badge
              label={task.category}
              bgColor={task.completed ? colors.neutral[200] : colors.primary[50]}
              color={task.completed ? colors.neutral[600] : colors.primary.dark}
            />
          </View>
          {pet ? (
            <Text style={styles.petName} numberOfLines={1}>
              {pet.name} · {pet.species}
            </Text>
          ) : null}
          {task.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{task.scheduledTime}</Text>
            </View>
            {task.frequency === 'weekly' && (
              <View style={styles.metaItem}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{DAYS[task.dayOfWeek]}</Text>
              </View>
            )}
            <View style={[styles.freqTag, task.frequency === 'daily' ? styles.dailyTag : styles.weeklyTag]}>
              <Text style={styles.freqText}>{task.frequency === 'daily' ? 'Daily' : 'Weekly'}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.xs,
  },
  cardCompleted: {
    opacity: 0.65,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.primary.main,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  petName: {
    ...typography.body2,
    color: colors.primary.dark,
    fontWeight: '600',
    marginTop: 2,
  },
  desc: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  freqTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: 'auto',
  },
  dailyTag: {
    backgroundColor: colors.secondary[50],
  },
  weeklyTag: {
    backgroundColor: colors.accent[50],
  },
  freqText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
