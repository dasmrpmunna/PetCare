import { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors, typography, spacing } from '@/lib/theme';
import { validateName, validateEmail, validatePassword } from '@/lib/validation';
import { PawPrint } from 'lucide-react-native';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = !confirmPassword
      ? 'Please confirm your password'
      : confirmPassword !== password
        ? 'Passwords do not match'
        : null;

    if (nameErr || emailErr || passErr || confirmErr) {
      setErrors({
        name: nameErr || undefined,
        email: emailErr || undefined,
        password: passErr || undefined,
        confirm: confirmErr || undefined,
      });
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (!result.success) {
      setErrors({ form: result.error });
    } else {
      router.replace('/(tabs)/dashboard');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <PawPrint size={40} color={colors.neutral[0]} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PetCare and never miss a task</Text>
        </View>

        {errors.form ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errors.form}</Text>
          </View>
        ) : null}

        <Input
          label="Full Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          placeholder="Jane Doe"
          testID="register-name"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          testID="register-email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          placeholder="At least 6 characters"
          secureTextEntry
          testID="register-password"
        />
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
          }}
          error={errors.confirm}
          placeholder="Re-enter password"
          secureTextEntry
          testID="register-confirm"
        />

        <Button label="Create Account" onPress={handleRegister} loading={loading} testID="register-submit" fullWidth />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => router.push('/login')}>
            Sign In
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.body,
    color: colors.primary.main,
    fontWeight: '600',
  },
});
