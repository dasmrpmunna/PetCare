import { useState, type ReactNode } from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable } from 'react-native';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  testID,
  rightIcon,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          multiline && styles.multiline,
        ]}
      >
        <TextInput
          testID={testID}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize={isPassword || keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
            {showPassword ? (
              <EyeOff size={20} color={colors.neutral[500]} />
            ) : (
              <Eye size={20} color={colors.neutral[500]} />
            )}
          </Pressable>
        )}
        {!isPassword && rightIcon}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary.main,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
  },
  multiline: {
    alignItems: 'flex-start',
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
