import { createPersistStore } from "../utils/store";
import { StoreKey } from "../constant";
import { DbConfiguration, DbConnectionArgs } from "../utils/datatypes";

export interface KGConfig {
  connectionArgs: DbConnectionArgs;
  resultNum: number;
  description?: string;
  useReflexion?: boolean;
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

const is_kg_config_default_config = (kgInfo: KGConfig): boolean => {
  return (
    kgInfo.connectionArgs.host === 'local' &&
    kgInfo.connectionArgs.port === '7687' &&
    kgInfo.resultNum === 3
  );
}

export const DEFAULT_KG_STATE = {
  config: createEmptyKGConfig(),
  useKG: false,
}
export type KGState = typeof DEFAULT_KG_STATE;

export const useKGStore = createPersistStore(
  { ...DEFAULT_KG_STATE },
  (set, get) => {
    const methods = {
      initializeKG(kgInfo?: DbConfiguration) {
        if (kgInfo === undefined) {
          return;
        }
        if (kgInfo.enabled !== undefined && kgInfo.enabled == false) {
          return;
        }
        if (!kgInfo.servers || kgInfo.servers.length === 0) {
          return;
        }
        const config = get().config;
        if (!is_kg_config_default_config(config)) {
          return;
        }
        const server = kgInfo.servers[0];
        this.updateConfig((config: KGConfig) => {
          config.connectionArgs.host = server.address;
          config.connectionArgs.port = server.port ?? "7687";
          config.resultNum = server.number_of_results ?? config.resultNum;
        });
      },
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
