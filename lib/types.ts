export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
}

export type PetSpecies = 'Dog' | 'Cat' | 'Bird' | 'Fish' | 'Rabbit' | 'Reptile' | 'Hamster' | 'Other';

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight: string;
  gender: 'Male' | 'Female' | 'Unknown';
  notes: string;
  photoUrl: string;
  createdAt: number;
}

export type TaskFrequency = 'daily' | 'weekly';
export type TaskCategory = 'Feeding' | 'Walking' | 'Grooming' | 'Medication' | 'Training' | 'Vet Visit' | 'Cleaning' | 'Playtime' | 'Other';

export interface CareTask {
  id: string;
  userId: string;
  petId: string;
  title: string;
  description: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  scheduledTime: string;
  dayOfWeek: number;
  completed: boolean;
  completedDate: number | null;
  lastResetDate: string;
  createdAt: number;
}

export interface SmsDelegation {
  id: string;
  userId: string;
  petId: string;
  taskId: string | null;
  caregiverName: string;
  caregiverPhone: string;
  message: string;
  sentAt: number;
}
