import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { storage } from './storage';
import { useAuth } from './auth';
import { generateId } from './validation';
import type { Pet, CareTask, SmsDelegation, PetSpecies, TaskCategory, TaskFrequency } from './types';

interface DataContextValue {
  pets: Pet[];
  tasks: CareTask[];
  delegations: SmsDelegation[];
  dataLoading: boolean;

  addPet: (data: Omit<Pet, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updatePet: (id: string, data: Partial<Omit<Pet, 'id' | 'userId'>>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  getPet: (id: string) => Pet | undefined;

  addTask: (data: Omit<CareTask, 'id' | 'userId' | 'createdAt' | 'completed' | 'completedDate' | 'lastResetDate'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Omit<CareTask, 'id' | 'userId'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => CareTask | undefined;
  toggleTaskComplete: (id: string) => Promise<void>;
  resetTodaysTasks: () => Promise<void>;

  addDelegation: (data: Omit<SmsDelegation, 'id' | 'userId' | 'sentAt'>) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function getTodayStr() {
  return new Date().toDateString();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [delegations, setDelegations] = useState<SmsDelegation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) {
      setPets([]);
      setTasks([]);
      setDelegations([]);
      setDataLoading(false);
      return;
    }
    const [allPets, allTasks, allDelegs] = await Promise.all([
      storage.getPets(),
      storage.getTasks(),
      storage.getDelegations(),
    ]);
    setPets(allPets.filter((p) => p.userId === user.id));
    setTasks(allTasks.filter((t) => t.userId === user.id));
    setDelegations(allDelegs.filter((d) => d.userId === user.id));
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-reset daily tasks on load
  useEffect(() => {
    if (!user || tasks.length === 0) return;
    const today = getTodayStr();
    const needsReset = tasks.some((t) => t.frequency === 'daily' && t.lastResetDate !== today);
    if (needsReset) {
      (async () => {
        const allTasks = await storage.getTasks();
        let changed = false;
        const updated = allTasks.map((t) => {
          if (t.userId === user.id && t.frequency === 'daily' && t.lastResetDate !== today) {
            changed = true;
            return { ...t, completed: false, completedDate: null, lastResetDate: today };
          }
          return t;
        });
        if (changed) {
          await storage.saveTasks(updated);
          setTasks(updated.filter((t) => t.userId === user.id));
        }
      })();
    }
  }, [user, tasks]);

  const addPet: DataContextValue['addPet'] = async (data) => {
    if (!user) return;
    const allPets = await storage.getPets();
    const newPet: Pet = {
      ...data,
      id: generateId(),
      userId: user.id,
      createdAt: Date.now(),
    };
    allPets.push(newPet);
    await storage.savePets(allPets);
    setPets((prev) => [...prev, newPet]);
  };

  const updatePet: DataContextValue['updatePet'] = async (id, data) => {
    if (!user) return;
    const allPets = await storage.getPets();
    const updated = allPets.map((p) => (p.id === id ? { ...p, ...data } : p));
    await storage.savePets(updated);
    setPets(updated.filter((p) => p.userId === user.id));
  };

  const deletePet: DataContextValue['deletePet'] = async (id) => {
    if (!user) return;
    const allPets = await storage.getPets();
    const filtered = allPets.filter((p) => p.id !== id);
    await storage.savePets(filtered);
    // Also delete associated tasks
    const allTasks = await storage.getTasks();
    const filteredTasks = allTasks.filter((t) => t.petId !== id);
    await storage.saveTasks(filteredTasks);
    setPets(filtered.filter((p) => p.userId === user.id));
    setTasks(filteredTasks.filter((t) => t.userId === user.id));
  };

  const getPet = (id: string) => pets.find((p) => p.id === id);

  const addTask: DataContextValue['addTask'] = async (data) => {
    if (!user) return;
    const allTasks = await storage.getTasks();
    const today = getTodayStr();
    const newTask: CareTask = {
      ...data,
      id: generateId(),
      userId: user.id,
      completed: false,
      completedDate: null,
      lastResetDate: today,
      createdAt: Date.now(),
    };
    allTasks.push(newTask);
    await storage.saveTasks(allTasks);
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask: DataContextValue['updateTask'] = async (id, data) => {
    if (!user) return;
    const allTasks = await storage.getTasks();
    const updated = allTasks.map((t) => (t.id === id ? { ...t, ...data } : t));
    await storage.saveTasks(updated);
    setTasks(updated.filter((t) => t.userId === user.id));
  };

  const deleteTask: DataContextValue['deleteTask'] = async (id) => {
    if (!user) return;
    const allTasks = await storage.getTasks();
    const filtered = allTasks.filter((t) => t.id !== id);
    await storage.saveTasks(filtered);
    setTasks(filtered.filter((t) => t.userId === user.id));
  };

  const getTask = (id: string) => tasks.find((t) => t.id === id);

  const toggleTaskComplete: DataContextValue['toggleTaskComplete'] = async (id) => {
    if (!user) return;
    const allTasks = await storage.getTasks();
    const updated = allTasks.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedDate: !t.completed ? Date.now() : null }
        : t
    );
    await storage.saveTasks(updated);
    setTasks(updated.filter((t) => t.userId === user.id));
  };

  const resetTodaysTasks: DataContextValue['resetTodaysTasks'] = async () => {
    if (!user) return;
    const today = getTodayStr();
    const allTasks = await storage.getTasks();
    const updated = allTasks.map((t) =>
      t.userId === user.id
        ? { ...t, completed: false, completedDate: null, lastResetDate: today }
        : t
    );
    await storage.saveTasks(updated);
    setTasks(updated.filter((t) => t.userId === user.id));
  };

  const addDelegation: DataContextValue['addDelegation'] = async (data) => {
    if (!user) return;
    const allDelegs = await storage.getDelegations();
    const newDeleg: SmsDelegation = {
      ...data,
      id: generateId(),
      userId: user.id,
      sentAt: Date.now(),
    };
    allDelegs.push(newDeleg);
    await storage.saveDelegations(allDelegs);
    setDelegations((prev) => [...prev, newDeleg]);
  };

  return (
    <DataContext.Provider
      value={{
        pets,
        tasks,
        delegations,
        dataLoading,
        addPet,
        updatePet,
        deletePet,
        getPet,
        addTask,
        updateTask,
        deleteTask,
        getTask,
        toggleTaskComplete,
        resetTodaysTasks,
        addDelegation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export { getTodayStr };

export type { PetSpecies, TaskCategory, TaskFrequency };
