import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { StoreKey } from "../constant";

export type RAGConfig = {
  id: string;
  useRAG: boolean;
  splitByTokens: boolean;
  chunkSize: number;
  overlapSize: number;
  numResults: number;
  docIds: Array<string>;
};

export const createEmptyRAGConfig = (): RAGConfig => 
({
  id: nanoid(),
  useRAG: false,
  splitByTokens: false,
  chunkSize: 1000,
  overlapSize: 0,
  numResults: 3,
  docIds: []
});

export const DEFAULT_RAG_STATE = {
  configs: {} as Record<string, RAGConfig>
}

export type RagState = typeof DEFAULT_RAG_STATE;

export const useRAGStore = createPersistStore(
  { ...DEFAULT_RAG_STATE },
  (set, get) => ({
    create(ragconfig?: Partial<RAGConfig>) {
      const configs = get().configs;
      const id = nanoid();
      configs[id] = {
        ...createEmptyRAGConfig(),
        ...ragconfig,
        id,
      };
      set(() => ({configs}));
      get().markUpdate();

      return configs[id];
    },
    updateRAGConfig(id: string, updater: (config: RAGConfig) => void) {},
    get(id: string) {
      return get().configs[id];
    }
  }),
  {
    name: StoreKey.RAG,
    version: 3.1,
    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as RagState;
      if (version < 3) {
        Object.values(newState.configs).forEach((m) => (m.id = nanoid()));
      }
      if (version < 3.1) {
        const updatedRAGConfigs: Record<string, RAGConfig> = {};
        Object.values(newState.configs).forEach((m) => {
          updatedRAGConfigs[m.id] = m;
        });
        newState.configs = updatedRAGConfigs;
      }
      return newState as any;
    }
  }
)

