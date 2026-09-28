import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Pet, CareTask, SmsDelegation } from './types';

const KEYS = {
  USERS: '@petcare:users',
  SESSION: '@petcare:session',
  PETS: '@petcare:pets',
  TASKS: '@petcare:tasks',
  DELEGATIONS: '@petcare:delegations',
} as const;

async function readArray<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function writeArray<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  // ---- Users ----
  async getUsers(): Promise<User[]> {
    return readArray<User>(KEYS.USERS);
  },
  async saveUsers(users: User[]): Promise<void> {
    return writeArray(KEYS.USERS, users);
  },

  // ---- Session ----
  async getSession(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.SESSION);
    } catch {
      return null;
    }
  },
  async setSession(userId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SESSION, userId);
  },
  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.SESSION);
  },

  // ---- Pets ----
  async getPets(): Promise<Pet[]> {
    return readArray<Pet>(KEYS.PETS);
  },
  async savePets(pets: Pet[]): Promise<void> {
    return writeArray(KEYS.PETS, pets);
  },

  // ---- Tasks ----
  async getTasks(): Promise<CareTask[]> {
    return readArray<CareTask>(KEYS.TASKS);
  },
  async saveTasks(tasks: CareTask[]): Promise<void> {
    return writeArray(KEYS.TASKS, tasks);
  },

  // ---- Delegations ----
  async getDelegations(): Promise<SmsDelegation[]> {
    return readArray<SmsDelegation>(KEYS.DELEGATIONS);
  },
  async saveDelegations(delegations: SmsDelegation[]): Promise<void> {
    return writeArray(KEYS.DELEGATIONS, delegations);
  },
};
