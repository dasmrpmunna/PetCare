import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { colors, typography, spacing } from '@/lib/theme';
import { PawPrint } from 'lucide-react-native';

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <PawPrint size={64} color={colors.neutral[0]} />
      </View>
      <Text style={styles.title}>PetCare</Text>
      <Text style={styles.subtitle}>Your pet's daily companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[0],
    fontSize: 36,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[100],
    marginTop: spacing.xs,
  },
});
