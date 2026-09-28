import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export function Chip({ label, selected, onPress, color }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: color || colors.primary.main, borderColor: color || colors.primary.main }
          : styles.chipUnselected,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.neutral[0] : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  chipText: {
    ...typography.body2,
    fontWeight: '500',
  },
});
