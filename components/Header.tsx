import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { ChevronLeft } from 'lucide-react-native';
import { type ReactNode } from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  subtitle?: string;
}

export function Header({ title, onBack, rightIcon, onRightPress, subtitle }: HeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.backBtn} />
      )}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {rightIcon && onRightPress ? (
        <Pressable onPress={onRightPress} style={styles.rightBtn}>
          {rightIcon}
        </Pressable>
      ) : (
        <View style={styles.rightBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rightBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
