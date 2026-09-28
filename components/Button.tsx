import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: { bg: colors.primary.main, text: colors.neutral[0], border: colors.primary.main },
    secondary: { bg: colors.secondary.main, text: colors.neutral[0], border: colors.secondary.main },
    outline: { bg: 'transparent', text: colors.primary.main, border: colors.primary.main },
    danger: { bg: colors.error, text: colors.neutral[0], border: colors.error },
    text: { bg: 'transparent', text: colors.primary.main, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: variantStyles.bg, borderColor: variantStyles.border },
        variant === 'outline' && styles.outline,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: variantStyles.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.button,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
