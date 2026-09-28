import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/lib/data';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { validateRequired, validateName } from '@/lib/validation';
import type { PetSpecies } from '@/lib/types';
import { PawPrint } from 'lucide-react-native';

const SPECIES: PetSpecies[] = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Reptile', 'Hamster', 'Other'];
const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦', Fish: '🐟', Rabbit: '🐰', Reptile: '🦎', Hamster: '🐹', Other: '🐾',
};

export default function AddPetScreen() {
  const { addPet } = useData();
  const router = useRouter();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Unknown'>('Unknown');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const nameErr = validateName(name);
    if (nameErr) {
      setErrors({ name: nameErr });
      return;
    }
    setErrors({});
    setLoading(true);
    await addPet({
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age.trim(),
      weight: weight.trim(),
      gender,
      notes: notes.trim(),
      photoUrl: '',
    });
    setLoading(false);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Add New Pet" onBack={() => router.back()} />

        <View style={styles.iconPreview}>
          <Text style={styles.emoji}>{SPECIES_EMOJI[species]}</Text>
        </View>

        <Input
          label="Pet Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          placeholder="e.g. Buddy, Luna, Max"
          testID="pet-name"
        />

        <Text style={styles.label}>Species</Text>
        <View style={styles.chipsRow}>
          {SPECIES.map((s) => (
            <Chip
              key={s}
              label={`${SPECIES_EMOJI[s]} ${s}`}
              selected={species === s}
              onPress={() => setSpecies(s)}
            />
          ))}
        </View>

        <Input
          label="Breed (optional)"
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g. Golden Retriever"
        />

        <Input
          label="Age (optional)"
          value={age}
          onChangeText={setAge}
          placeholder="e.g. 3 years"
        />

        <Input
          label="Weight (optional)"
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 12 kg"
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipsRow}>
          <Chip label="Male" selected={gender === 'Male'} onPress={() => setGender('Male')} />
          <Chip label="Female" selected={gender === 'Female'} onPress={() => setGender('Female')} />
          <Chip label="Unknown" selected={gender === 'Unknown'} onPress={() => setGender('Unknown')} />
        </View>

        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special care instructions..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.actions}>
          <Button label="Cancel" onPress={() => router.back()} variant="outline" />
          <Button label="Save Pet" onPress={handleSave} loading={loading} icon={<PawPrint size={18} color={colors.neutral[0]} />} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  iconPreview: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 40,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
