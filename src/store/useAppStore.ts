import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  AppSettings,
  Collection,
  CsvDataset,
  Environment,
  HistoryEntry,
  RunProgress,
} from "@/types";
import { storageService } from "@/services/storageService";

interface AppState {
  collections: Collection[];
  environments: Environment[];
  csvDatasets: CsvDataset[];
  history: HistoryEntry[];
  settings: AppSettings;

  selectedCollectionId: string | null;
  selectedEnvironmentId: string | null;
  selectedCsvId: string | null;

  runProgress: RunProgress;

  hydrated: boolean;

  hydrate: () => Promise<void>;

  addCollection: (collection: Collection) => Promise<void>;
  removeCollection: (id: string) => Promise<void>;

  addEnvironment: (environment: Environment) => Promise<void>;
  removeEnvironment: (id: string) => Promise<void>;

  addCsvDataset: (dataset: CsvDataset) => Promise<void>;
  removeCsvDataset: (id: string) => Promise<void>;

  setSelectedCollection: (id: string | null) => void;
  setSelectedEnvironment: (id: string | null) => void;
  setSelectedCsv: (id: string | null) => void;

  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  setRunProgress: (progress: Partial<RunProgress>) => void;
  resetRunProgress: () => void;

  addHistoryEntry: (entry: HistoryEntry) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  continueOnFailure: true,
  requestDelayMs: 0,
  timeoutMs: 15000,
  authConfig: null,
};

const defaultRunProgress: RunProgress = {
  running: false,
  currentRow: 0,
  totalRows: 0,
  currentRequestName: "",
  successCount: 0,
  failureCount: 0,
  logs: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  collections: [],
  environments: [],
  csvDatasets: [],
  history: [],
  settings: defaultSettings,

  selectedCollectionId: null,
  selectedEnvironmentId: null,
  selectedCsvId: null,

  runProgress: defaultRunProgress,

  hydrated: false,

  hydrate: async () => {
    const [collections, environments, history, settings] = await Promise.all([
      storageService.readJson<Collection[]>("collections.json", []),
      storageService.readJson<Environment[]>("environments.json", []),
      storageService.readJson<HistoryEntry[]>("history.json", []),
      storageService.readJson<AppSettings>("settings.json", defaultSettings),
    ]);
    set({
      collections,
      environments,
      history,
      settings,
      hydrated: true,
      selectedCollectionId: collections[0]?.id ?? null,
      selectedEnvironmentId: environments[0]?.id ?? null,
    });
  },

  addCollection: async (collection) => {
    const collections = [...get().collections, collection];
    set({ collections, selectedCollectionId: collection.id });
    await storageService.writeJson("collections.json", collections);
  },

  removeCollection: async (id) => {
    const collections = get().collections.filter((c) => c.id !== id);
    set({
      collections,
      selectedCollectionId:
        get().selectedCollectionId === id ? null : get().selectedCollectionId,
    });
    await storageService.writeJson("collections.json", collections);
  },

  addEnvironment: async (environment) => {
    const environments = [...get().environments, environment];
    set({ environments, selectedEnvironmentId: environment.id });
    await storageService.writeJson("environments.json", environments);
  },

  removeEnvironment: async (id) => {
    const environments = get().environments.filter((e) => e.id !== id);
    set({
      environments,
      selectedEnvironmentId:
        get().selectedEnvironmentId === id
          ? null
          : get().selectedEnvironmentId,
    });
    await storageService.writeJson("environments.json", environments);
  },

  addCsvDataset: async (dataset) => {
    const csvDatasets = [...get().csvDatasets, dataset];
    set({ csvDatasets, selectedCsvId: dataset.id });
  },

  removeCsvDataset: async (id) => {
    const csvDatasets = get().csvDatasets.filter((d) => d.id !== id);
    set({
      csvDatasets,
      selectedCsvId: get().selectedCsvId === id ? null : get().selectedCsvId,
    });
  },

  setSelectedCollection: (id) => set({ selectedCollectionId: id }),
  setSelectedEnvironment: (id) => set({ selectedEnvironmentId: id }),
  setSelectedCsv: (id) => set({ selectedCsvId: id }),

  updateSettings: async (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    await storageService.writeJson("settings.json", settings);
  },

  setRunProgress: (partial) =>
    set({ runProgress: { ...get().runProgress, ...partial } }),

  resetRunProgress: () => set({ runProgress: { ...defaultRunProgress, logs: [] } }),

  addHistoryEntry: async (entry) => {
    const history = [entry, ...get().history].slice(0, 200);
    set({ history });
    await storageService.writeJson("history.json", history);
  },

  clearHistory: async () => {
    set({ history: [] });
    await storageService.writeJson("history.json", []);
  },
}));

export function newId() {
  return uuid();
}
