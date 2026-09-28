import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useData } from '@/lib/data';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/Feedback';
import { Badge } from '@/components/Badge';
import { PawPrint, Plus, ChevronRight } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import type { Pet } from '@/lib/types';

const SPECIES_ICONS: Record<string, string> = {
  Dog: '🐕',
  Cat: '🐈',
  Bird: '🐦',
  Fish: '🐟',
  Rabbit: '🐰',
  Reptile: '🦎',
  Hamster: '🐹',
  Other: '🐾',
};

export default function PetsScreen() {
  const { pets, tasks, dataLoading } = useData();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {}, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  function renderPet({ item }: { item: Pet }) {
    const petTasks = tasks.filter((t) => t.petId === item.id);
    return (
      <Card
        onPress={() => router.push(`/pet/${item.id}`)}
        style={styles.petCard}
      >
        <View style={styles.petRow}>
          <View style={styles.petAvatar}>
            <Text style={styles.petEmoji}>{SPECIES_ICONS[item.species] || '🐾'}</Text>
          </View>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petDetails}>
              {item.species}{item.breed ? ` · ${item.breed}` : ''}
            </Text>
            <View style={styles.petMeta}>
              <Badge label={`${petTasks.length} tasks`} />
              {item.gender !== 'Unknown' && <Badge label={item.gender} bgColor={colors.accent[50]} color={colors.accent[500]} />}
            </View>
          </View>
          <ChevronRight size={20} color={colors.neutral[400]} />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>
        <Button
          label="Add Pet"
          onPress={() => router.push('/pet/add')}
          icon={<Plus size={18} color={colors.neutral[0]} />}
          fullWidth={false}
        />
      </View>

      {pets.length === 0 && !dataLoading ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={<PawPrint size={32} color={colors.primary.main} />}
            title="No Pets Yet"
            message="Add your first pet to start tracking their care routines"
            actionLabel="Add Your First Pet"
            onAction={() => router.push('/pet/add')}
          />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  emptyWrap: {
    flex: 1,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  petCard: {
    marginVertical: spacing.xs,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 28,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...typography.h4,
    color: colors.text,
  },
  petDetails: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 2,
  },
  petMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
