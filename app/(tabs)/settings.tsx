import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/Feedback';
import {
  User,
  Send,
  Info,
  LogOut,
  ChevronRight,
  PawPrint,
  ClipboardList,
  Calendar,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { pets, tasks, delegations, resetTodaysTasks } = useData();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <User size={28} color={colors.neutral[0]} />
          </View>
          <View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{pets.length}</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{delegations.length}</Text>
            <Text style={styles.statLabel}>Delegations</Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      <Text style={styles.sectionLabel}>Features</Text>
      <Card style={styles.menuCard}>
        <MenuItem
          icon={<Send size={20} color={colors.accent.main} />}
          label="SMS Delegation"
          subtitle="Send care tasks to a caregiver"
          onPress={() => router.push('/sms-delegation')}
        />
        <Divider />
        <MenuItem
          icon={<RotateCcw size={20} color={colors.secondary.main} />}
          label="Reset Today's Checklist"
          subtitle="Mark all today's tasks as incomplete"
          onPress={async () => {
            await resetTodaysTasks();
            Alert.alert('Success', "Today's checklist has been reset.");
          }}
        />
      </Card>

      <Text style={styles.sectionLabel}>About</Text>
      <Card style={styles.menuCard}>
        <MenuItem
          icon={<PawPrint size={20} color={colors.primary.main} />}
          label="PetCare"
          subtitle="Version 1.0.0"
          onPress={() => {}}
          showChevron={false}
        />
        <Divider />
        <MenuItem
          icon={<Info size={20} color={colors.info} />}
          label="About the App"
          subtitle="Track and manage your pet's daily care"
          onPress={() => {
            Alert.alert(
              'PetCare',
              'PetCare helps you manage your pet\'s daily and weekly care routines, delegate tasks via SMS, and never miss a feeding, walk, or medication.'
            );
          }}
          showChevron={false}
        />
      </Card>

      <Button
        label="Sign Out"
        onPress={() => setShowLogout(true)}
        variant="danger"
        icon={<LogOut size={18} color={colors.neutral[0]} />}
        fullWidth
      />

      <ConfirmDialog
        visible={showLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to access your pets and tasks."
        confirmLabel="Sign Out"
        danger
        onConfirm={async () => {
          setShowLogout(false);
          await logout();
          router.replace('/login');
        }}
        onCancel={() => setShowLogout(false)}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>PetCare · Made with care</Text>
      </View>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  showChevron = true,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <View style={styles.menuIconWrap}>{icon}</View>
      <View style={styles.menuTextWrap}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {showChevron && <ChevronRight size={20} color={colors.neutral[400]} />}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    ...typography.h4,
    color: colors.text,
  },
  profileEmail: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statNum: {
    ...typography.h3,
    color: colors.primary.dark,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  menuCard: {
    marginBottom: spacing.lg,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemPressed: {
    backgroundColor: colors.neutral[100],
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.neutral[400],
  },
});
