import { createPersistStore } from "../utils/store";
import { StoreKey } from "../constant";
import { DbConnectionArgs } from "../utils/datatypes";

export interface KGConfig {
  connectionArgs: DbConnectionArgs;
  resultNum: number;
  description?: string;
}

export const createEmptyKGConfig = (): KGConfig => ({
  connectionArgs: {
    host: "local",
    port: "7687",
    user: "neo4j",
    password: "neo4j",
  },
  resultNum: 3,
});

export const DEFAULT_KG_STATE = {
  config: createEmptyKGConfig(),
  useKG: false,
}
export type KGState = typeof DEFAULT_KG_STATE;

export const useKGStore = createPersistStore(
  { ...DEFAULT_KG_STATE },
  (set, get) => {
    const methods = {
      setUseKG(useKG: boolean) {
        set({
          useKG
        })
      },
      updateConfig(updater: (config: KGConfig) => void) {
        const config = get().config;
        updater(config);
        set(() => ({config}))
      }
    };
    return methods;
  },
  {
    name: StoreKey.KG,
    version: 3.1,
    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as KGState;
      return newState as any;
    }
  }
)
