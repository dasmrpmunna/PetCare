import { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { colors, spacing, borderRadius, elevation } from '@/lib/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: keyof typeof elevation;
}

import { Pressable } from 'react-native';

export function Card({ children, style, onPress, elevation: elev = 2 }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, elevation[elev], pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, elevation[elev], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
