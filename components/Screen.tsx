import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing } from '@/lib/theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, style }: ScreenProps) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});
