import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useData } from '@/lib/data';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { validateName } from '@/lib/validation';
import type { PetSpecies } from '@/lib/types';

const SPECIES: PetSpecies[] = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Reptile', 'Hamster', 'Other'];
const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐕', Cat: '🐈', Bird: '🐦', Fish: '🐟', Rabbit: '🐰', Reptile: '🦎', Hamster: '🐹', Other: '🐾',
};

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, updatePet } = useData();
  const router = useRouter();
  const pet = getPet(id);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Unknown'>('Unknown');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name);
      setSpecies(pet.species);
      setBreed(pet.breed);
      setAge(pet.age);
      setWeight(pet.weight);
      setGender(pet.gender);
      setNotes(pet.notes);
    }
  }, [pet?.id]);

  if (!pet) {
    return (
      <View style={styles.container}>
        <Header title="Pet Not Found" onBack={() => router.back()} />
      </View>
    );
  }

  async function handleSave() {
    const nameErr = validateName(name);
    if (nameErr) {
      setErrors({ name: nameErr });
      return;
    }
    setErrors({});
    setLoading(true);
    await updatePet(id, {
      name: name.trim(),
      species,
      breed: breed.trim(),
      age: age.trim(),
      weight: weight.trim(),
      gender,
      notes: notes.trim(),
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
        <Header title="Edit Pet" onBack={() => router.back()} />

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

        <Input label="Breed" value={breed} onChangeText={setBreed} placeholder="e.g. Golden Retriever" />
        <Input label="Age" value={age} onChangeText={setAge} placeholder="e.g. 3 years" />
        <Input label="Weight" value={weight} onChangeText={setWeight} placeholder="e.g. 12 kg" />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.chipsRow}>
          <Chip label="Male" selected={gender === 'Male'} onPress={() => setGender('Male')} />
          <Chip label="Female" selected={gender === 'Female'} onPress={() => setGender('Female')} />
          <Chip label="Unknown" selected={gender === 'Unknown'} onPress={() => setGender('Unknown')} />
        </View>

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special care instructions..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.actions}>
          <Button label="Cancel" onPress={() => router.back()} variant="outline" />
          <Button label="Save Changes" onPress={handleSave} loading={loading} />
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
