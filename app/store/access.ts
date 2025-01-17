import {
  ApiPath,
  DEFAULT_API_HOST,
  ServiceProvider,
  StoreKey,
} from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { ensure } from "../utils/clone";
import { requestTokenUsage } from "../client/datarequest";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : ApiPath.OpenAI;

const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  useCustomConfig: false,

  provider: ServiceProvider.OpenAI,

  // openai
  openaiUrl: DEFAULT_OPENAI_URL,
  openaiApiKey: "",

  // azure
  azureUrl: "",
  azureApiKey: "",
  azureApiVersion: "2023-08-01-preview",

  // server config
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
  disableFastLink: false,
  customModels: "",
  productionInfo: "undefined",
  tokenUsage: {
    auth_type: "Unknown",
    tokens: {
      "completion_tokens": 0,
      "prompt_tokens": 0,
      "total_tokens": 0,
    }
  }
};

export const useAccessStore = createPersistStore(
  { ...DEFAULT_ACCESS_STATE },

  (set, get) => ({
    enabledAccessControl() {
      this.fetch();

      return get().needCode;
    },

    isValidOpenAI() {
      return ensure(get(), ["openaiApiKey"]);
    },

    isValidAzure() {
      return ensure(get(), ["azureUrl", "azureApiKey", "azureApiVersion"]);
    },

    isAuthorized() {
      this.fetch();

      // has token or has code or disabled access control
      return (
        this.isValidOpenAI() ||
        this.isValidAzure() ||
        !this.enabledAccessControl() ||
        (this.enabledAccessControl() && ensure(get(), ["accessCode"]))
      );
    },
    async fetch() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
      fetchState = 1;
      try {
        const res = await fetch("/api/config", {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        });
        const jsonBody:DangerConfig = await res.json();
        console.log("[Config] got config from server", jsonBody);
        set(() => ({...jsonBody}));
      } catch (_e: any) {
        console.error("[Config] failed to fetch config");
      } finally {
        fetchState = 2;
      }        
    },
    async updateTokenUsage(session_id: string, model: string) {
      requestTokenUsage(session_id, model).then((res: any) => {
        res.json().then((dat: any) => {
          set({
            tokenUsage: {
              auth_type: dat.auth_type ?? "Unknown",
              tokens: {
                completion_tokens: dat.tokens?.completion_tokens ?? 0,
                prompt_tokens: dat.tokens?.prompt_tokens ?? 0,
                total_tokens: dat.tokens?.total_tokens ?? 0,
              }
            }
          });
        });
      });
    },
  }),
  {
    name: StoreKey.Access,
    version: 2.2,
    migrate(persistedState, version) {
      if (version < 2) {
        const state = persistedState as {
          token: string;
          openaiApiKey: string;
          azureApiVersion: string;
        };
        state.openaiApiKey = state.token;
        state.azureApiVersion = "2023-08-01-preview";
      }
      if (version < 2.1) {
        const state = persistedState as {
          productionInfo: string;
        }
        state.productionInfo = "undefined";
      }
      if (version < 2.2) {
        const state = persistedState as {
          tokenUsage: {
            auth_type: string,
            tokens: {
              "completion_tokens": number,
              "prompt_tokens": number,
              "total_tokens": number,
            }
          }
        }
        state.tokenUsage.auth_type = "Unknown";
        state.tokenUsage.tokens = {
          "completion_tokens": 0,
          "prompt_tokens": 0,
          "total_tokens": 0,
        }
      }

      return persistedState as any;
    },
  },
);
