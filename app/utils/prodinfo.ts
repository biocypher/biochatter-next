import { Mask, createEmptyMask } from "../store/mask";
import { 
  APIAgentInfo, 
  DbConfiguration, 
  DbConnectionArgs, 
  DbServerSettings, 
  ProductionInfo 
} from "./datatypes";
import Locale  from "../locales";
import { LLMModel } from "../client/api";

export function getOncoKBInfo(prodInfo?: ProductionInfo): APIAgentInfo {
  return (prodInfo?.OncoKBAPI ?? {enabled: false})
}

export function getKnowledgeGraphInfo(prodInfo?: ProductionInfo): DbConfiguration {
  return (prodInfo?.KnowledgeGraph ?? {servers: [], enabled: true});
}

export function getVectorStoreInfo(prodInfo?: ProductionInfo): DbConfiguration {
  return (prodInfo?.VectorStore ?? {servers: [], enabled: true});
}
export function getLLMModels(prodInfo?: ProductionInfo): Array<LLMModel> | undefined {
  return prodInfo?.LLMModels;
}

export function selectServerInfoFromDbConnectionArgs(
  dbConfig: DbConfiguration, 
  connectionArgs: DbConnectionArgs
): DbServerSettings | undefined {
  if (!dbConfig.servers || dbConfig.servers.length === 0) {
    return;
  }
  return dbConfig.servers.find((server) => (
    (server.address === connectionArgs.host ||
    server.server === connectionArgs.host) &&
    server.port === connectionArgs.port
  ));
}

export function getWelcomeAbout(prodInfo?: ProductionInfo): Record<string, any> | undefined {
  if (prodInfo) {
    return prodInfo?.Text?.Welcome?.About;
  } else {
    return Locale.Welcome.Page.About;
  }
}

export function getWelcomeWhat(prodInfo?: ProductionInfo): string | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.What ?? undefined;
  } else {
    return Locale.Welcome.Page.What;
  }
}
export function getWelcomeWhatMessages(prodInfo?: ProductionInfo): Array<string> | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.WhatMessages ?? undefined;
  } else {
    return Locale.Welcome.Page.WhatMessages;
  }
}
export function getWelcomeHow(prodInfo?: ProductionInfo): string | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.How ?? undefined;
  } else {
    return Locale.Welcome.Page.How;
  }
}
export function getWelcomeHowMessages(prodInfo?: ProductionInfo): Array<string> | undefined {
  if (prodInfo) {
    return prodInfo.Text?.Welcome?.HowMessages ?? undefined;
  } else {
    return Locale.Welcome.Page.HowMessages;
  }
}
export function getMaskInfo(prodInfo?: ProductionInfo): Mask | undefined {
  return prodInfo?.Text?.Masks ? prodInfo.Text.Masks[0] : undefined;
}

