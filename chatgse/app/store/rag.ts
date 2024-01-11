import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import { StoreKey } from "../constant";

export interface DbConnectionArgs {
  host: string;
  port: string;
  user?: string;
  password?: string
}
export interface RAGConfig {
  connectionArgs: DbConnectionArgs;
  splitByChar: boolean;
  chunkSize: number;
  overlapSize: number,
  resultNum: number;
  docIds?: Array<string>;
  selectedDocIds?: Array<string>;
}

export const createEmptyRAGConfig = (
  host?: string, 
  port?: string
): RAGConfig => 
({
  connectionArgs: {host: host??"local", port: port??"19530"},
  splitByChar: true,
  chunkSize: 1000,
  overlapSize: 0,
  resultNum: 3,
});

export const DEFAULT_RAG_STATE = {
  configs: [createEmptyRAGConfig()],
  currentConfigIndex: 0,
  useRAG: false,
}

export type RagState = typeof DEFAULT_RAG_STATE;

export const useRAGStore = createPersistStore(
  { ...DEFAULT_RAG_STATE },
  (set, get) => {
    const methods = {
      getUseRAG() {
        return get().useRAG;
      },
      setUseRAG(useRAG: boolean) {
        set({
          useRAG
        })
      },
      clearRAGConfig() {
        set(() => ({
          configs: [createEmptyRAGConfig()],
          currentConfigIndex: 0
        }));
      },
      selectRAGConfig(host: string, port: string) {
        const configs = get().configs;
        const index = configs.findIndex(
          (config) => (host === config.connectionArgs.host && port === config.connectionArgs.port)
        );
        console.log(`[selectRAGConfig] ${host} is ${index}`);
        if (index < 0) {
          const config = createEmptyRAGConfig(host, port);
          set({
            currentConfigIndex: 0,
            configs: [config].concat(configs)
          })
        } else {
          set((state) =>({
            currentConfigIndex: index,
            configs: [...state.configs],
            useRAG: state.useRAG,
          }))
          console.log(`[selectRAGConfig] ${get().currentConfigIndex}`);
        }
      },
      currentStore() {
        return get();
      },
      currentRAGConfig() {
        let index = get().currentConfigIndex;
        const configs = get().configs;
        if (index < 0 || index >= configs.length) {
          index = Math.min(configs.length-1, Math.max(0, index));
          set(() => ({
            currentConfigIndex: index
          }))
        }
        const config = configs[index];
        return config;
      },
      updateCurrentRAGConfig(updater: (config: RAGConfig) => void) {
        const configs = get().configs;
        const index = get().currentConfigIndex;
        updater(configs[index]);
        set(() => ({configs}));
      }
    }
    return methods;
  },
  {
    name: StoreKey.RAG,
    version: 3.1,
    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as RagState;
      
      return newState as any;
    }
  }
)
