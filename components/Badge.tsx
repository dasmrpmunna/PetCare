import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export function Badge({ label, color, bgColor }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor || colors.primary[50] }]}>
      <Text style={[styles.badgeText, { color: color || colors.primary.dark }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
